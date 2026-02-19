import { initializeDatabase, insert, saveDb } from './database-simple.js';

// Initialize database
await initializeDatabase();

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

console.log('🌱 Seeding database with sample data...\n');

// Sample patients
const patients = [
  {
    patient_id: generateId(),
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    room: '101',
    condition: 'Post-operative recovery',
    diagnosis: 'Appendectomy',
    care_mode: 'live_monitoring',
    status: 'stable',
    admission_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    discharge_time: null,
    active: 1,
    notes: 'Patient recovering well from surgery',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    patient_id: generateId(),
    name: 'Sarah Smith',
    age: 62,
    gender: 'Female',
    room: '203',
    condition: 'Diabetes management',
    diagnosis: 'Type 2 Diabetes Mellitus',
    care_mode: 'task_based',
    status: 'attention',
    admission_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    discharge_time: null,
    active: 1,
    notes: 'Blood sugar monitoring required',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    patient_id: generateId(),
    name: 'Maria Garcia',
    age: 38,
    gender: 'Female',
    room: '305',
    condition: 'Pneumonia treatment',
    diagnosis: 'Community-acquired pneumonia',
    care_mode: 'live_monitoring',
    status: 'stable',
    admission_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    discharge_time: null,
    active: 1,
    notes: 'Responding well to antibiotics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Insert patients
patients.forEach(patient => {
  insert('patients', patient);
  console.log(`✅ Created patient: ${patient.name}`);
});

// Add vitals for monitored patients
const monitoredPatients = patients.filter(p => p.care_mode === 'live_monitoring');

monitoredPatients.forEach(patient => {
  // Add 5 vitals readings
  for (let i = 0; i < 5; i++) {
    const timestamp = new Date(Date.now() - (4 - i) * 60 * 60 * 1000).toISOString();
    
    insert('vitals', {
      vital_id: generateId(),
      patient_id: patient.patient_id,
      heart_rate: 70 + Math.floor(Math.random() * 20),
      systolic_bp: 110 + Math.floor(Math.random() * 20),
      diastolic_bp: 70 + Math.floor(Math.random() * 15),
      spo2: 95 + Math.floor(Math.random() * 5),
      temperature: 36.5 + Math.random() * 1.5,
      respiratory_rate: 14 + Math.floor(Math.random() * 6),
      timestamp
    });
  }
  console.log(`  📊 Added vitals for ${patient.name}`);
});

// Add medications
const medications = [
  { patient: patients[0], name: 'Ibuprofen', dosage: '400mg', route: 'oral', frequency: '3x daily', timing: 'after meals' },
  { patient: patients[0], name: 'Amoxicillin', dosage: '500mg', route: 'oral', frequency: '2x daily', timing: null },
  { patient: patients[1], name: 'Metformin', dosage: '850mg', route: 'oral', frequency: '2x daily', timing: 'with meals' },
  { patient: patients[1], name: 'Insulin Glargine', dosage: '20 units', route: 'injection', frequency: '1x daily', timing: 'bedtime' },
  { patient: patients[2], name: 'Azithromycin', dosage: '500mg', route: 'IV', frequency: '1x daily', timing: null },
  { patient: patients[2], name: 'Albuterol', dosage: '2 puffs', route: 'inhaled', frequency: 'as needed', timing: null }
];

medications.forEach(med => {
  insert('medications', {
    medication_id: generateId(),
    patient_id: med.patient.patient_id,
    name: med.name,
    dosage: med.dosage,
    route: med.route,
    frequency: med.frequency,
    timing: med.timing,
    start_time: new Date().toISOString(),
    end_time: null,
    status: 'active',
    created_at: new Date().toISOString()
  });
});
console.log(`💊 Added ${medications.length} medications`);

// Add doctor instructions
const instructions = [
  { patient: patients[0], text: 'Monitor surgical site for infection', priority: 'high', due_time: null },
  { patient: patients[0], text: 'Encourage ambulation 3x daily', priority: 'medium', due_time: null },
  { patient: patients[1], text: 'Check blood glucose before meals', priority: 'high', due_time: 'Before each meal' },
  { patient: patients[1], text: 'Administer insulin at bedtime', priority: 'high', due_time: '10:00 PM' },
  { patient: patients[2], text: 'Monitor oxygen saturation', priority: 'high', due_time: 'Every 4 hours' },
  { patient: patients[2], text: 'Chest physiotherapy 2x daily', priority: 'medium', due_time: '9:00 AM, 5:00 PM' }
];

instructions.forEach(inst => {
  insert('doctor_instructions', {
    instruction_id: generateId(),
    patient_id: inst.patient.patient_id,
    instruction_text: inst.text,
    priority: inst.priority,
    due_time: inst.due_time,
    created_by: 'Dr. Smith',
    created_at: new Date().toISOString(),
    completed: 0,
    completed_at: null
  });
});
console.log(`📋 Added ${instructions.length} doctor instructions`);

// Add nurse tasks
const tasks = [
  { patient: patients[0], text: 'Change surgical dressing', priority: 'high', status: 'completed' },
  { patient: patients[0], text: 'Assist with ambulation', priority: 'medium', status: 'pending' },
  { patient: patients[1], text: 'Blood glucose check', priority: 'high', status: 'completed' },
  { patient: patients[1], text: 'Administer evening insulin', priority: 'high', status: 'pending' },
  { patient: patients[2], text: 'Administer IV antibiotics', priority: 'high', status: 'completed' },
  { patient: patients[2], text: 'Chest physiotherapy session', priority: 'medium', status: 'pending' }
];

tasks.forEach(task => {
  const created_at = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const completed_at = task.status === 'completed' ? new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() : null;
  
  insert('nurse_tasks', {
    task_id: generateId(),
    patient_id: task.patient.patient_id,
    task_text: task.text,
    priority: task.priority,
    status: task.status,
    due_time: null,
    linked_instruction_id: null,
    created_at,
    completed_at,
    completed_by: task.status === 'completed' ? 'Nurse Johnson' : null
  });
});
console.log(`✅ Added ${tasks.length} nurse tasks`);

// Add messages
const messages = [
  { patient: patients[0], role: 'doctor', name: 'Dr. Smith', text: 'Patient is recovering well. Continue current treatment plan.' },
  { patient: patients[0], role: 'nurse', name: 'Nurse Johnson', text: 'Noted. Surgical site looks clean, no signs of infection.' },
  { patient: patients[1], role: 'nurse', name: 'Nurse Johnson', text: 'Blood sugar levels have been elevated this morning.' },
  { patient: patients[1], role: 'doctor', name: 'Dr. Smith', text: 'Increase insulin dose by 2 units. Monitor closely.' },
  { patient: patients[2], role: 'doctor', name: 'Dr. Smith', text: 'Patient responding well to antibiotics. Continue current regimen.' },
  { patient: patients[2], role: 'nurse', name: 'Nurse Johnson', text: 'SpO2 levels improving. Patient breathing easier.' }
];

messages.forEach(msg => {
  insert('messages', {
    message_id: generateId(),
    patient_id: msg.patient.patient_id,
    sender_role: msg.role,
    sender_name: msg.name,
    message_text: msg.text,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  });
});
console.log(`💬 Added ${messages.length} messages`);

// Add sample reports
const reports = [
  { patient: patients[0], name: 'Pre-op Blood Work', type: 'BLOOD_TEST', findings: 'All values within normal range' },
  { patient: patients[1], name: 'HbA1c Test Results', type: 'LAB_REPORT', findings: 'HbA1c: 7.8% - indicates need for better glucose control' },
  { patient: patients[2], name: 'Chest X-Ray', type: 'XRAY', findings: 'Bilateral infiltrates consistent with pneumonia' }
];

reports.forEach(report => {
  insert('reports', {
    report_id: generateId(),
    patient_id: report.patient.patient_id,
    file_name: report.name,
    report_type: report.type,
    extracted_text: null,
    findings: report.findings,
    uploaded_at: new Date().toISOString()
  });
});
console.log(`📄 Added ${reports.length} reports`);

// Save database
await saveDb();

console.log('\n✨ Database seeded successfully!');
console.log(`\n📊 Summary:`);
console.log(`   - ${patients.length} patients`);
console.log(`   - ${monitoredPatients.length * 5} vitals readings`);
console.log(`   - ${medications.length} medications`);
console.log(`   - ${instructions.length} doctor instructions`);
console.log(`   - ${tasks.length} nurse tasks`);
console.log(`   - ${messages.length} messages`);
console.log(`   - ${reports.length} reports`);
console.log(`\n🚀 Start the server with: npm start`);
