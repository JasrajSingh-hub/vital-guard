import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import RoleSelection from './components/RoleSelection';
import Dashboard from './pages/Dashboard';
import PatientDetail from './pages/PatientDetail';
import { Patient, User } from './types';
import { fetchPatients, createPatient, fetchPatient } from './services/apiService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patients from API
  useEffect(() => {
    loadPatients();
  }, []);

  // Load selected patient details
  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetails(selectedPatientId);
    } else {
      setSelectedPatient(null);
    }
  }, [selectedPatientId]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPatients();
      // Convert backend format to frontend format
      const formattedPatients = data.map((p: any) => ({
        id: p.patient_id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        condition: p.condition,
        room: p.room,
        patientType: p.care_mode === 'live_monitoring' ? 'MONITORED' : 'CONTEXT_ONLY',
        history: [],
        riskLevel: p.status.toUpperCase(),
        lastUpdated: p.updated_at,
        context: {
          diagnosis: p.diagnosis || '',
          medications: [],
          doctorInstructions: [],
          reports: [],
          messages: []
        }
      }));
      setPatients(formattedPatients);
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients. Make sure backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    try {
      const data = await fetchPatient(patientId);
      // Convert backend format to frontend format
      const formattedPatient: Patient = {
        id: data.patient_id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        condition: data.condition,
        room: data.room,
        patientType: data.care_mode === 'live_monitoring' ? 'MONITORED' : 'CONTEXT_ONLY',
        history: data.vitals?.map((v: any) => ({
          timestamp: v.timestamp,
          heartRate: v.heart_rate,
          systolicBp: v.systolic_bp,
          diastolicBp: v.diastolic_bp,
          spO2: v.spo2,
          respRate: v.respiratory_rate,
          temperature: v.temperature
        })) || [],
        riskLevel: data.status.toUpperCase(),
        aiAnalysis: data.aiSummary?.overview || undefined,
        lastUpdated: data.updated_at,
        context: {
          diagnosis: data.diagnosis || '',
          medications: data.medications?.map((m: any) => ({
            id: m.medication_id,
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            route: m.route,
            timing: m.timing
          })) || [],
          doctorInstructions: data.instructions?.map((i: any) => ({
            id: i.instruction_id,
            instruction: i.instruction_text,
            priority: i.priority.toUpperCase(),
            dueTime: i.due_time,
            createdAt: i.created_at,
            createdBy: i.created_by
          })) || [],
          reports: data.reports?.map((r: any) => ({
            id: r.report_id,
            url: '', // Not stored in backend
            uploadedAt: r.uploaded_at,
            extractedData: r.extracted_text,
            type: r.report_type,
            reportName: r.file_name,
            findings: r.findings
          })) || [],
          messages: data.messages?.map((m: any) => ({
            id: m.message_id,
            patientId: m.patient_id,
            role: m.sender_role.toUpperCase(),
            userName: m.sender_name,
            message: m.message_text,
            timestamp: m.timestamp,
            type: 'COMMENT'
          })) || []
        }
      };
      setSelectedPatient(formattedPatient);
    } catch (err: any) {
      console.error('Error loading patient details:', err);
      setError('Failed to load patient details');
    }
  };

  const handlePatientUpdate = async (updatedPatient: Patient) => {
    // Reload patient details from backend
    await loadPatientDetails(updatedPatient.id);
    // Reload patients list
    await loadPatients();
  };

  const handleAddPatient = async (newPatient: Omit<Patient, 'id' | 'lastUpdated'>) => {
    try {
      // Convert frontend format to backend format
      const backendPatient = {
        name: newPatient.name,
        age: newPatient.age,
        gender: newPatient.gender,
        room: newPatient.room,
        condition: newPatient.condition,
        diagnosis: newPatient.context?.diagnosis || '',
        care_mode: newPatient.patientType === 'MONITORED' ? 'live_monitoring' : 'task_based',
        notes: newPatient.context?.notes || ''
      };
      
      await createPatient(backendPatient);
      // Reload patients list
      await loadPatients();
    } catch (err: any) {
      console.error('Error adding patient:', err);
      alert('Failed to add patient. Make sure backend is running.');
    }
  };

  // Show role selection if no user is logged in
  if (!currentUser) {
    return <RoleSelection onRoleSelect={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">⚠️ {error}</p>
            <p className="text-red-600 text-sm mt-1">Make sure the backend is running: <code>cd backend && npm start</code></p>
            <button 
              onClick={loadPatients}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <span className="ml-4 text-gray-500 text-lg">Loading Patient Data from Backend...</span>
          </div>
        ) : selectedPatient ? (
          <PatientDetail 
            patient={selectedPatient}
            currentUser={currentUser}
            onBack={() => setSelectedPatientId(null)}
            onUpdatePatient={handlePatientUpdate}
          />
        ) : (
          <Dashboard 
            patients={patients}
            currentUser={currentUser}
            onPatientClick={setSelectedPatientId}
            onAddPatient={handleAddPatient}
          />
        )}
      </main>
    </div>
  );
};

export default App;
