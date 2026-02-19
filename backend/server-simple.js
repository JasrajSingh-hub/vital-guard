import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, findAll, findOne, findMany, insert, update, remove, saveDb } from './database-simple.js';
import { generatePatientSummary, generateDischargeSummary, analyzeVitals } from './geminiService.js';
import { grantPatientConsent, storeEncryptedRecordHash, verifyEncryptedRecordHash } from './blockchainService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize database
await initializeDatabase();

// Helper function to generate IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// ==================== PATIENT ENDPOINTS ====================

// Get all active patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await findMany('patients', { active: 1 });
    patients.sort((a, b) => new Date(b.admission_time) - new Date(a.admission_time));
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all discharged patients
app.get('/api/patients/discharged', async (req, res) => {
  try {
    const patients = await findMany('patients', { active: 0 });
    patients.sort((a, b) => new Date(b.discharge_time) - new Date(a.discharge_time));
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single patient with all related data
app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await findOne('patients', { patient_id: id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    
    const vitals = await findMany('vitals', { patient_id: id });
    vitals.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const medications = await findMany('medications', { patient_id: id, status: 'active' });
    const instructions = await findMany('doctor_instructions', { patient_id: id });
    instructions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const tasks = await findMany('nurse_tasks', { patient_id: id });
    tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const messages = await findMany('messages', { patient_id: id });
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const reports = await findMany('reports', { patient_id: id });
    reports.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    const summaries = await findMany('ai_summaries', { patient_id: id });
    summaries.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
    const latestSummary = summaries[0] || null;
    
    res.json({
      success: true,
      data: {
        ...patient,
        vitals,
        medications,
        instructions,
        tasks,
        messages,
        reports,
        aiSummary: latestSummary
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new patient
app.post('/api/patients', async (req, res) => {
  try {
    const { name, age, gender, room, condition, diagnosis, care_mode, notes } = req.body;
    
    const patient = {
      patient_id: generateId(),
      name,
      age,
      gender,
      room,
      condition,
      diagnosis: diagnosis || null,
      care_mode,
      status: 'stable',
      admission_time: new Date().toISOString(),
      discharge_time: null,
      active: 1,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await insert('patients', patient);
    await saveDb();
    
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update patient
app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, room, condition, diagnosis, status, notes } = req.body;
    
    const updated = await update('patients', { patient_id: id }, {
      name,
      age,
      gender,
      room,
      condition,
      diagnosis,
      status,
      notes,
      updated_at: new Date().toISOString()
    });
    
    await saveDb();
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== VITALS ENDPOINTS ====================

// Add vitals
app.post('/api/patients/:id/vitals', async (req, res) => {
  try {
    const { id } = req.params;
    const { heart_rate, systolic_bp, diastolic_bp, spo2, temperature, respiratory_rate } = req.body;
    
    const vital = {
      vital_id: generateId(),
      patient_id: id,
      heart_rate,
      systolic_bp,
      diastolic_bp,
      spo2,
      temperature,
      respiratory_rate,
      timestamp: new Date().toISOString()
    };
    
    await insert('vitals', vital);
    
    // Analyze vitals with AI
    const patient = await findOne('patients', { patient_id: id });
    const analysis = await analyzeVitals(patient, { heart_rate, systolic_bp, diastolic_bp, spo2, temperature, respiratory_rate });
    
    // Update patient status
    await update('patients', { patient_id: id }, {
      status: analysis.riskLevel,
      updated_at: new Date().toISOString()
    });
    
    await saveDb();
    
    res.json({ success: true, data: vital, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== MEDICATION ENDPOINTS ====================

// Add medication
app.post('/api/patients/:id/medications', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, route, frequency, timing } = req.body;
    
    const medication = {
      medication_id: generateId(),
      patient_id: id,
      name,
      dosage,
      route,
      frequency,
      timing: timing || null,
      start_time: new Date().toISOString(),
      end_time: null,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    await insert('medications', medication);
    await saveDb();
    
    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete medication
app.delete('/api/medications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await remove('medications', { medication_id: id });
    await saveDb();
    
    res.json({ success: true, message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DOCTOR INSTRUCTIONS ENDPOINTS ====================

// Add instruction
app.post('/api/patients/:id/instructions', async (req, res) => {
  try {
    const { id } = req.params;
    const { instruction_text, priority, due_time, created_by } = req.body;
    
    const instruction = {
      instruction_id: generateId(),
      patient_id: id,
      instruction_text,
      priority,
      due_time: due_time || null,
      created_by,
      created_at: new Date().toISOString(),
      completed: 0,
      completed_at: null
    };
    
    await insert('doctor_instructions', instruction);
    await saveDb();
    
    res.json({ success: true, data: instruction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete instruction
app.delete('/api/instructions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await remove('doctor_instructions', { instruction_id: id });
    await saveDb();
    
    res.json({ success: true, message: 'Instruction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== NURSE TASKS ENDPOINTS ====================

// Add task
app.post('/api/patients/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { task_text, priority, due_time, linked_instruction_id } = req.body;
    
    const task = {
      task_id: generateId(),
      patient_id: id,
      task_text,
      priority,
      due_time: due_time || null,
      linked_instruction_id: linked_instruction_id || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      completed_at: null,
      completed_by: null
    };
    
    await insert('nurse_tasks', task);
    await saveDb();
    
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete task
app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_by } = req.body;
    
    const updated = await update('nurse_tasks', { task_id: id }, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by
    });
    
    await saveDb();
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== MESSAGES ENDPOINTS ====================

// Add message
app.post('/api/patients/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { sender_role, sender_name, message_text } = req.body;
    
    const message = {
      message_id: generateId(),
      patient_id: id,
      sender_role,
      sender_name,
      message_text,
      timestamp: new Date().toISOString()
    };
    
    await insert('messages', message);
    await saveDb();
    
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== REPORTS ENDPOINTS ====================

// Add report
app.post('/api/patients/:id/reports', async (req, res) => {
  try {
    const { id } = req.params;
    const { file_name, report_type, extracted_text, findings } = req.body;
    
    const report = {
      report_id: generateId(),
      patient_id: id,
      file_name,
      report_type,
      extracted_text: extracted_text || null,
      findings: findings || null,
      uploaded_at: new Date().toISOString()
    };
    
    await insert('reports', report);
    await saveDb();
    
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await remove('reports', { report_id: id });
    await saveDb();
    
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== AI SUMMARY ENDPOINTS ====================

// Generate and save AI summary
app.post('/api/patients/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await findOne('patients', { patient_id: id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    
    const vitals = await findMany('vitals', { patient_id: id });
    vitals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentVitals = vitals.slice(0, 10);
    const medications = await findMany('medications', { patient_id: id, status: 'active' });
    const instructions = await findMany('doctor_instructions', { patient_id: id });
    const tasks = await findMany('nurse_tasks', { patient_id: id });
    const reports = await findMany('reports', { patient_id: id });
    
    const patientData = {
      ...patient,
      vitals: recentVitals,
      medications,
      instructions,
      tasks,
      reports
    };
    
    const summary = await generatePatientSummary(patientData);
    
    const summaryRecord = {
      summary_id: generateId(),
      patient_id: id,
      overview: summary.overview,
      key_points: JSON.stringify(summary.keyPoints),
      recent_changes: JSON.stringify(summary.recentChanges),
      recommendations: JSON.stringify(summary.recommendations),
      generated_at: new Date().toISOString()
    };
    
    await insert('ai_summaries', summaryRecord);
    await saveDb();
    
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DISCHARGE ENDPOINTS ====================

// Discharge patient
app.post('/api/patients/:id/discharge', async (req, res) => {
  try {
    const { id } = req.params;
    
    const discharge_time = new Date().toISOString();
    
    const patient = await findOne('patients', { patient_id: id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    
    const vitals = await findMany('vitals', { patient_id: id });
    vitals.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const medications = await findMany('medications', { patient_id: id });
    const instructions = await findMany('doctor_instructions', { patient_id: id });
    const tasks = await findMany('nurse_tasks', { patient_id: id });
    const messages = await findMany('messages', { patient_id: id });
    const reports = await findMany('reports', { patient_id: id });
    
    const patientData = {
      ...patient,
      discharge_time,
      vitals,
      medications,
      instructions,
      tasks,
      messages,
      reports
    };
    
    const aiSummary = await generateDischargeSummary(patientData);
    
    const lengthOfStay = Math.ceil((new Date(discharge_time) - new Date(patient.admission_time)) / (1000 * 60 * 60 * 24));
    
    const dischargeReport = {
      patient_id: id,
      patient_name: patient.name,
      age: patient.age,
      gender: patient.gender,
      room: patient.room,
      admission_time: patient.admission_time,
      discharge_time,
      length_of_stay: lengthOfStay,
      diagnosis: patient.diagnosis,
      condition: patient.condition,
      final_status: patient.status,
      care_mode: patient.care_mode,
      vitals_summary: {
        total_readings: vitals.length,
        first_reading: vitals[0] || null,
        last_reading: vitals[vitals.length - 1] || null
      },
      medications: medications.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route
      })),
      instructions_completed: instructions.filter(i => i.completed).length,
      instructions_total: instructions.length,
      tasks_completed: tasks.filter(t => t.status === 'completed').length,
      tasks_total: tasks.length,
      reports_uploaded: reports.length,
      ai_discharge_summary: aiSummary,
      generated_at: new Date().toISOString()
    };
    
    const reportRecord = {
      report_id: generateId(),
      patient_id: id,
      report_data: JSON.stringify(dischargeReport),
      generated_at: discharge_time
    };
    
    await insert('discharge_reports', reportRecord);
    
    await update('patients', { patient_id: id }, {
      active: 0,
      discharge_time,
      updated_at: new Date().toISOString()
    });
    
    await saveDb();
    
    res.json({ success: true, data: dischargeReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get discharge report
app.get('/api/patients/:id/discharge-report', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reports = await findMany('discharge_reports', { patient_id: id });
    reports.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
    const report = reports[0];
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Discharge report not found' });
    }
    
    res.json({ success: true, data: JSON.parse(report.report_data) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

// ==================== BLOCKCHAIN ENDPOINTS ====================

// Store encrypted record hash on chain
app.post('/api/blockchain/records', async (req, res) => {
  try {
    const { patientId, encryptedRecord } = req.body;
    const result = await storeEncryptedRecordHash(patientId, encryptedRecord);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify encrypted record hash on chain
app.post('/api/blockchain/verify', async (req, res) => {
  try {
    const { patientId, encryptedRecord } = req.body;
    const result = await verifyEncryptedRecordHash(patientId, encryptedRecord);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log patient consent on chain
app.post('/api/blockchain/consent', async (req, res) => {
  try {
    const { patientId } = req.body;
    const result = await grantPatientConsent(patientId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VitalGuard AI Backend is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VitalGuard AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'} / ${process.env.MONGODB_DB_NAME || 'vitalguard'}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
});
