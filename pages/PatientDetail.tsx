import React, { useState } from 'react';
import { Patient, Vitals, User } from '../types';
import {
  ArrowLeft,
  User as UserIcon,
  Activity,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Pill
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import VitalsForm from '../components/VitalsForm';
import PatientContextManager from '../components/PatientContextManager';
import NurseTaskView from '../components/NurseTaskView';
import MessagesDrawer from '../components/MessagesDrawer';
import MedicationsDrawer from '../components/MedicationsDrawer';
import AIPatientSummary from '../components/AIPatientSummary';
import { addInstruction, addVitals, fetchPatient } from '../services/apiService';
import { simpleHash } from '../services/blockchainDemoService';

interface PatientDetailProps {
  patient: Patient;
  currentUser: User;
  onBack: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  currentUser,
  onBack,
  onUpdatePatient
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [doctorInstruction, setDoctorInstruction] = useState('');
  const [instructionPriority, setInstructionPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  const isContextOnly = patient.patientType === 'CONTEXT_ONLY';
  const isDoctor = currentUser.role === 'DOCTOR';
  const isNurse = currentUser.role === 'NURSE';
  const isPatient = currentUser.role === 'PATIENT';

  const messages = patient.context?.messages || [];
  const unreadCount = messages.filter((m) => m.role !== currentUser.role).length;

  const chartData = patient.history.map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hr: h.heartRate,
    sys: h.systolicBp,
    dia: h.diastolicBp,
    spO2: h.spO2
  }));

  const handleVitalsSubmit = async (newVitals: Omit<Vitals, 'timestamp'>) => {
    setIsAnalyzing(true);
    try {
      await addVitals(patient.id, {
        heart_rate: newVitals.heartRate,
        systolic_bp: newVitals.systolicBp,
        diastolic_bp: newVitals.diastolicBp,
        spo2: newVitals.spO2,
        respiratory_rate: newVitals.respRate,
        temperature: newVitals.temperature
      });

      const updatedPatientData = await fetchPatient(patient.id);
      const updatedPatient: Patient = {
        id: updatedPatientData.patient_id,
        name: updatedPatientData.name,
        age: updatedPatientData.age,
        gender: updatedPatientData.gender,
        room: updatedPatientData.room,
        condition: updatedPatientData.condition,
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
        context: patient.context
      };

      onUpdatePatient(updatedPatient);
    } catch (err) {
      console.error('Error submitting vitals:', err);
      alert('Failed to save vitals. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDoctorInstruction = async () => {
    if (!doctorInstruction.trim()) return;
    try {
      await addInstruction(patient.id, {
        instruction_text: doctorInstruction.trim(),
        priority: instructionPriority.toLowerCase(),
        due_time: ''
      });
      setDoctorInstruction('');
      await onUpdatePatient(patient);
    } catch (err) {
      console.error('Error adding doctor instruction:', err);
      alert('Failed to add instruction.');
    }
  };

  const roleLabel = isDoctor ? 'Doctor View' : isNurse ? 'Nurse View' : 'Patient View';
  const roleBadgeClass = isDoctor
    ? 'bg-sky-100 text-sky-800 border-sky-300'
    : isNurse
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : 'bg-rose-100 text-rose-800 border-rose-300';
  const blockchainHash = simpleHash(`${patient.id}-${patient.lastUpdated}-${patient.riskLevel}`);
  const blockchainTx = simpleHash(`tx-${patient.id}-${patient.lastUpdated}`);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900 font-semibold">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isPatient ? 'Back to My Panel' : 'Back to Dashboard'}
      </button>

      <section className="bg-white rounded-lg border border-slate-300 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-slate-300 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-slate-700" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{patient.name}</h1>
              <p className="text-lg text-slate-600">
                {patient.age} yrs | {patient.gender} | Room {patient.room}
              </p>
              <p className="text-sm text-slate-500 mt-1">{patient.condition}</p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                isContextOnly ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-sky-100 text-sky-800 border-sky-300'
              }`}
            >
              {isContextOnly ? 'Task-Based Care' : 'Live Monitoring'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${roleBadgeClass}`}>
              {roleLabel}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowMedications(true)}
                className="flex items-center px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
              >
                <Pill className="w-4 h-4 mr-2" />
                Meds
              </button>
              <button
                onClick={() => setShowMessages(true)}
                className="relative flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-slate-300 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Blockchain Record Integrity</h3>
          <span className="px-2 py-1 rounded text-xs font-semibold bg-sky-100 text-sky-800">
            Timestamp: {new Date(patient.lastUpdated).toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-slate-600">Record Hash</p>
        <p className="font-mono text-xs text-slate-900 break-all">{blockchainHash}</p>
        <p className="text-xs text-slate-600 mt-2">Transaction ID: {blockchainTx}</p>
        <button
          onClick={() => alert(`Demo explorer:\nNetwork: Ethereum Sepolia (Demo)\nTx: ${blockchainTx}`)}
          className="mt-3 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
        >
          View on Blockchain
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="h-full">
          {isNurse ? (
            <div className="bg-emerald-50 rounded-lg border border-emerald-300 p-6 h-full">
              <NurseTaskView
                patient={patient}
                currentUser={currentUser}
                onTaskComplete={(taskId) => console.log('Task completed:', taskId)}
              />
            </div>
          ) : (
            <AIPatientSummary patient={patient} autoGenerate={true} />
          )}
        </section>

        <section className="bg-white rounded-lg border border-slate-300 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Status</h3>
          {!isContextOnly && (
            <div
              className={`rounded-lg border p-4 mb-4 ${
                patient.riskLevel === 'CRITICAL'
                  ? 'bg-red-50 border-red-300'
                  : patient.riskLevel === 'ATTENTION'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex items-center mb-2">
                {patient.riskLevel === 'CRITICAL' ? (
                  <AlertTriangle className="mr-2 text-red-600 w-5 h-5" />
                ) : patient.riskLevel === 'ATTENTION' ? (
                  <AlertTriangle className="mr-2 text-amber-600 w-5 h-5" />
                ) : (
                  <CheckCircle className="mr-2 text-emerald-600 w-5 h-5" />
                )}
                <span className="font-semibold text-slate-800">Risk: {patient.riskLevel}</span>
              </div>
              <p className="text-sm text-slate-700">{patient.aiAnalysis || 'No analysis available yet.'}</p>
            </div>
          )}

          {!isContextOnly && patient.history.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const latest = patient.history[patient.history.length - 1];
                return (
                  <>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-500 font-semibold">Heart Rate</div>
                      <div className="text-xl font-semibold text-slate-900">{latest.heartRate} bpm</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-500 font-semibold">Blood Pressure</div>
                      <div className="text-xl font-semibold text-slate-900">
                        {latest.systolicBp}/{latest.diastolicBp}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-500 font-semibold">SpO2</div>
                      <div className="text-xl font-semibold text-slate-900">{latest.spO2}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-xs text-slate-500 font-semibold">Temperature</div>
                      <div className="text-xl font-semibold text-slate-900">{latest.temperature}C</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {isContextOnly && (
            <p className="text-sm text-slate-600 italic">
              This patient is in task-based care mode. No live vitals monitoring.
            </p>
          )}
        </section>
      </div>

      {isDoctor && (
        <section className="bg-white rounded-lg border border-slate-300 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Add Doctor Instruction</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <textarea
              value={doctorInstruction}
              onChange={(e) => setDoctorInstruction(e.target.value)}
              rows={2}
              className="md:col-span-3 w-full px-3 py-2 border border-slate-300 rounded-md"
              placeholder="Add instruction for assigned nurse/doctor..."
            />
            <div className="space-y-2">
              <select
                value={instructionPriority}
                onChange={(e) => setInstructionPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <button
                onClick={handleDoctorInstruction}
                className="w-full px-3 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-800"
              >
                Add
              </button>
            </div>
          </div>
        </section>
      )}

      {isNurse && <PatientContextManager patient={patient} onUpdatePatient={onUpdatePatient} />}

      {isNurse && !isPatient && !isContextOnly && (
        <>
          <VitalsForm onSubmit={handleVitalsSubmit} isAnalyzing={isAnalyzing} />
          {chartData.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-300 p-6">
              <div className="flex items-center mb-4">
                <Activity className="w-5 h-5 text-slate-700 mr-2" />
                <h3 className="text-lg font-semibold text-slate-900">Vitals Trends</h3>
              </div>
              <div className="h-64 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" domain={[40, 160]} />
                    <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="hr" stroke="#b91c1c" name="Heart Rate (bpm)" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="spO2" stroke="#0f766e" name="SpO2 (%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis domain={[40, 200]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sys" stroke="#1d4ed8" name="Systolic" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="dia" stroke="#60a5fa" name="Diastolic" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      <MessagesDrawer
        patient={patient}
        currentUser={currentUser}
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
        onUpdatePatient={onUpdatePatient}
      />

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
