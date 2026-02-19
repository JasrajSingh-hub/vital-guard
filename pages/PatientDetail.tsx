import React, { useState } from 'react';
import { Patient, Vitals, User } from '../types';
import { ArrowLeft, User as UserIcon, Activity, AlertTriangle, CheckCircle, MessageSquare, ChevronDown, ChevronUp, Pill } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import VitalsForm from '../components/VitalsForm';
import PatientContextManager from '../components/PatientContextManager';
import NurseTaskView from '../components/NurseTaskView';
import MessagesDrawer from '../components/MessagesDrawer';
import MedicationsDrawer from '../components/MedicationsDrawer';
import AIPatientSummary from '../components/AIPatientSummary';
import { addVitals, fetchPatient } from '../services/apiService';

interface PatientDetailProps {
  patient: Patient;
  currentUser: User;
  onBack: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, currentUser, onBack, onUpdatePatient }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    medications: false,
    reports: false,
    vitalsHistory: false,
    instructions: false
  });

  const isContextOnly = patient.patientType === 'CONTEXT_ONLY';
  const isDoctor = currentUser.role === 'DOCTOR';
  const isNurse = currentUser.role === 'NURSE';

  // Count unread messages (messages from other role)
  const messages = patient.context?.messages || [];
  const unreadCount = messages.filter(m => m.role !== currentUser.role).length;

  const chartData = patient.history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hr: h.heartRate,
    sys: h.systolicBp,
    dia: h.diastolicBp,
    spO2: h.spO2
  }));

  const handleVitalsSubmit = async (newVitals: Omit<Vitals, 'timestamp'>) => {
    setIsAnalyzing(true);
    
    try {
      // Send vitals to backend API
      await addVitals(patient.id, {
        heart_rate: newVitals.heartRate,
        systolic_bp: newVitals.systolicBp,
        diastolic_bp: newVitals.diastolicBp,
        spo2: newVitals.spO2,
        respiratory_rate: newVitals.respRate,
        temperature: newVitals.temperature
      });

      // Reload patient data from backend to get updated vitals and AI analysis
      const updatedPatientData = await fetchPatient(patient.id);
      
      // Convert backend format to frontend format
      const updatedPatient: Patient = {
        id: updatedPatientData.patient_id,
        name: updatedPatientData.name,
        age: updatedPatientData.age,
        gender: updatedPatientData.gender,
        room: updatedPatientData.room,
        condition: updatedPatientData.condition,
        diagnosis: updatedPatientData.diagnosis,
        patientType: updatedPatientData.care_mode === 'live_monitoring' ? 'MONITORED' : 'CONTEXT_ONLY',
        riskLevel: updatedPatientData.status.toUpperCase() as 'STABLE' | 'ATTENTION' | 'CRITICAL',
        aiAnalysis: updatedPatientData.ai_analysis || '',
        lastUpdated: updatedPatientData.last_updated || new Date().toISOString(),
        history: (updatedPatientData.vitals || []).map((v: any) => ({
          heartRate: v.heart_rate,
          systolicBp: v.systolic_bp,
          diastolicBp: v.diastolic_bp,
          spO2: v.spo2,
          respRate: v.respiratory_rate,
          temperature: v.temperature,
          timestamp: v.timestamp
        })),
        context: {
          medications: (updatedPatientData.medications || []).map((m: any) => ({
            id: m.medication_id,
            name: m.name,
            dosage: m.dosage,
            route: m.route,
            timing: m.timing,
            status: m.status
          })),
          reports: (updatedPatientData.reports || []).map((r: any) => ({
            id: r.report_id,
            type: r.file_name.split('.').pop() || 'unknown',
            date: r.uploaded_at,
            summary: r.extracted_text
          })),
          doctorInstructions: (updatedPatientData.doctor_instructions || []).map((i: any) => ({
            id: i.instruction_id,
            text: i.instruction_text,
            priority: i.priority,
            dueTime: i.due_time,
            completed: i.completed
          })),
          nurseTasks: (updatedPatientData.nurse_tasks || []).map((t: any) => ({
            id: t.task_id,
            text: t.task_text,
            status: t.status,
            completedAt: t.completed_at
          })),
          messages: (updatedPatientData.messages || []).map((msg: any) => ({
            id: msg.message_id,
            role: msg.sender_role.toUpperCase() as 'DOCTOR' | 'NURSE',
            sender: msg.sender_name,
            text: msg.message_text,
            timestamp: msg.timestamp
          }))
        }
      };

      onUpdatePatient(updatedPatient);
    } catch (err) {
      console.error("Error submitting vitals:", err);
      alert("Failed to save vitals. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    console.log('Task completed:', taskId, 'by', currentUser.name);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      {/* SECTION 1: Patient Snapshot (Always Visible) */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-lg text-gray-600">{patient.age} yrs • {patient.gender} • Room {patient.room}</p>
              <p className="text-sm text-gray-500 mt-1">{patient.condition}</p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {/* Care Mode Badge */}
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              isContextOnly 
                ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' 
                : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
            }`}>
              {isContextOnly ? '📋 Task-Based Care' : '📊 Live Monitoring'}
            </span>

            {/* Role Badge */}
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              isDoctor ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-green-100 text-green-800 border-2 border-green-300'
            }`}>
              {isDoctor ? '👨‍⚕️ Doctor View' : '👩‍⚕️ Nurse View'}
            </span>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {/* Medications & Instructions Button */}
              <button
                onClick={() => setShowMedications(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold shadow-md"
              >
                <Pill className="w-4 h-4 mr-2" />
                Meds & Instructions
              </button>

              {/* Messages Button with Badge */}
              <button
                onClick={() => setShowMessages(true)}
                className="relative flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Primary Area (Role-Based) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tasks (Nurse) or AI Overview (Doctor) */}
        <div className="h-full">
          {isNurse ? (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-300 p-6 h-full">
              <NurseTaskView 
                patient={patient} 
                currentUser={currentUser}
                onTaskComplete={handleTaskComplete}
              />
            </div>
          ) : (
            <div className="h-full">
              <AIPatientSummary patient={patient} autoGenerate={true} />
            </div>
          )}
        </div>

        {/* Right: AI Overview (Nurse) or Recent Updates (Doctor) */}
        <div className="h-full">
          {isNurse ? (
            <div className="h-full">
              <AIPatientSummary patient={patient} autoGenerate={true} />
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Nurse Updates</h3>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-bold rounded-full">
                  READ ONLY
                </span>
              </div>

              {/* Risk Indicator */}
              {!isContextOnly && (
                <div className={`rounded-lg border-2 p-4 mb-4 ${
                  patient.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-300' :
                  patient.riskLevel === 'ATTENTION' ? 'bg-yellow-50 border-yellow-300' :
                  'bg-green-50 border-green-300'
                }`}>
                  <div className="flex items-center mb-2">
                    {patient.riskLevel === 'CRITICAL' ? <AlertTriangle className="mr-2 text-red-600 w-5 h-5" /> :
                     patient.riskLevel === 'ATTENTION' ? <AlertTriangle className="mr-2 text-yellow-600 w-5 h-5" /> :
                     <CheckCircle className="mr-2 text-green-600 w-5 h-5" />}
                    <span className={`font-bold ${
                      patient.riskLevel === 'CRITICAL' ? 'text-red-800' :
                      patient.riskLevel === 'ATTENTION' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      Risk Indicator: {patient.riskLevel}
                    </span>
                    <span className="ml-2 px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-bold rounded">
                      AI GENERATED
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{patient.aiAnalysis || "No analysis available yet."}</p>
                </div>
              )}

              {/* Latest Vitals */}
              {!isContextOnly && patient.history.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const latest = patient.history[patient.history.length - 1];
                    return (
                      <>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500 font-semibold">Heart Rate</div>
                          <div className="text-xl font-bold text-gray-900">{latest.heartRate} bpm</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500 font-semibold">Blood Pressure</div>
                          <div className="text-xl font-bold text-gray-900">{latest.systolicBp}/{latest.diastolicBp}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500 font-semibold">SpO2</div>
                          <div className="text-xl font-bold text-gray-900">{latest.spO2}%</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500 font-semibold">Temperature</div>
                          <div className="text-xl font-bold text-gray-900">{latest.temperature}°C</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {isContextOnly && (
                <p className="text-sm text-gray-600 italic">
                  This patient is in task-based care mode. No live vitals monitoring.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Secondary Panels (Collapsible) */}
      <div className="space-y-4">
        {/* Medications & Reports (Nurse can edit, Doctor read-only) */}
        {isNurse ? (
          <PatientContextManager patient={patient} onUpdatePatient={onUpdatePatient} />
        ) : null}

        {/* Vitals History (Nurse only, for monitored patients) */}
        {isNurse && !isContextOnly && (
          <>
            <VitalsForm onSubmit={handleVitalsSubmit} isAnalyzing={isAnalyzing} />
            
            {chartData.length > 0 ? (
              <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                <button
                  onClick={() => toggleSection('vitalsHistory')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">Vitals Trends</h3>
                  </div>
                  {expandedSections.vitalsHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.vitalsHistory && (
                  <div className="px-6 pb-6">
                    <div className="h-64 w-full mb-8">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Heart Rate & SpO2</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="time" />
                          <YAxis yAxisId="left" domain={[40, 160]} />
                          <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="hr" stroke="#ef4444" name="Heart Rate (bpm)" strokeWidth={2} dot={false} />
                          <Line yAxisId="right" type="monotone" dataKey="spO2" stroke="#06b6d4" name="SpO2 (%)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-64 w-full">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Blood Pressure</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="time" />
                          <YAxis domain={[40, 200]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="sys" stroke="#3b82f6" name="Systolic" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="dia" stroke="#93c5fd" name="Diastolic" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
                <div className="flex items-center mb-2">
                  <Activity className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-bold text-blue-900">No Vitals Recorded Yet</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Use the form above to record the first set of vitals for this patient. Charts will appear once vitals are recorded.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Messages Drawer */}
      <MessagesDrawer
        patient={patient}
        currentUser={currentUser}
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
        onUpdatePatient={onUpdatePatient}
      />

      {/* Medications & Instructions Drawer */}
      <MedicationsDrawer
        patient={patient}
        currentUser={currentUser}
        isOpen={showMedications}
        onClose={() => setShowMedications(false)}
      />
    </div>
  );
};

export default PatientDetail;
