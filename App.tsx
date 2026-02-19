import React, { useEffect, useMemo, useState } from 'react';
import Navigation from './components/Navigation';
import RoleSelection from './components/RoleSelection';
import Dashboard from './pages/Dashboard';
import PatientDetail from './pages/PatientDetail';
import ConsentManagementPage from './pages/ConsentManagementPage';
import BlockchainVerificationPage from './pages/BlockchainVerificationPage';
import AuditTrailPage from './pages/AuditTrailPage';
import InteroperabilitySimulationPage from './pages/InteroperabilitySimulationPage';
import AIInsightsPage from './pages/AIInsightsPage';
import PatientPanelPage from './pages/PatientPanelPage';
import {
  AppPage,
  AuditEntry,
  BlockchainRecordProof,
  ConsentDuration,
  ConsentRecord,
  Patient,
  ReferralRecord,
  StoredUser,
  TeamMessage,
  User,
  UserRole
} from './types';
import { fetchPatients, createPatient, fetchPatient } from './services/apiService';
import { createTransactionId, getConsentExpiry, isExpired } from './services/blockchainDemoService';
import { approveUser, assignPatientsToUser, getStoredUsers } from './services/authService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<AppPage>('DASHBOARD');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [verificationLog, setVerificationLog] = useState<BlockchainRecordProof[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<StoredUser[]>([]);
  const [referralRecords, setReferralRecords] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRegisteredUsers(getStoredUsers());
  }, []);

  useEffect(() => {
    loadPatients();
  }, []);

  const currentProfile = useMemo(
    () => (currentUser ? registeredUsers.find((u) => u.uid === currentUser.uid) || null : null),
    [currentUser, registeredUsers]
  );

  const scopedPatients = useMemo(() => {
    if (!currentUser) return patients;
    if (currentUser.role === 'ADMIN') return patients;
    if (currentUser.role === 'PATIENT') {
      const assigned = currentProfile?.assignedPatientIds || [];
      if (assigned.length > 0) return patients.filter((p) => assigned.includes(p.id));
      return patients.slice(0, 1);
    }
    if (currentUser.role === 'DOCTOR' || currentUser.role === 'NURSE') {
      const assigned = currentProfile?.assignedPatientIds || [];
      return patients.filter((p) => assigned.includes(p.id));
    }
    return patients;
  }, [patients, currentUser, currentProfile]);

  const canAccessPage = (role: UserRole, page: AppPage): boolean => {
    if (role === 'PATIENT') return page === 'PATIENT_PANEL' || page === 'CONSENT';
    if (page === 'PATIENT_PANEL') return role === 'PATIENT';
    if (page === 'DASHBOARD' || page === 'PATIENTS' || page === 'AI_INSIGHTS') return true;
    if (page === 'CONSENT') return role === 'PATIENT';
    if (page === 'AUDIT_LOG' || page === 'INTEROPERABILITY') return role === 'ADMIN';
    if (page === 'BLOCKCHAIN_VERIFY') return role === 'ADMIN' || role === 'DOCTOR';
    return false;
  };

  useEffect(() => {
    setConsents((prev) =>
      prev.map((consent) =>
        consent.status === 'ACTIVE' && isExpired(consent.expiresAt)
          ? { ...consent, status: 'EXPIRED' }
          : consent
      )
    );
  }, [activePage]);

  const addAudit = (action: string, target: string, status: 'VERIFIED' | 'TAMPERED' = 'VERIFIED') => {
    if (!currentUser) return;
    const entry: AuditEntry = {
      id: Date.now().toString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      target,
      timestamp: new Date().toISOString(),
      verificationStatus: status,
      blockchainRef: createTransactionId(`${action}-${target}`)
    };
    setAuditEntries((prev) => [entry, ...prev]);
  };

  const formatPatientUid = (id: string) => `PT-${String(id).padStart(4, '0')}`;

  const syncAssignments = (allPatients: Patient[]) => {
    if (allPatients.length === 0) return;
    const users = getStoredUsers();
    let changed = false;
    const approvedStaff = users.filter(
      (u) => (u.role === 'DOCTOR' || u.role === 'NURSE') && u.approvalStatus === 'APPROVED'
    );
    approvedStaff.forEach((u, idx) => {
      if (u.assignedPatientIds.length === 0) {
        const assignedPatient = allPatients[idx % allPatients.length];
        assignPatientsToUser(u.uid, [assignedPatient.id]);
        changed = true;
      }
    });
    const patientsUsers = users.filter((u) => u.role === 'PATIENT');
    patientsUsers.forEach((u, idx) => {
      if (u.assignedPatientIds.length === 0) {
        const assignedPatient = allPatients[idx % allPatients.length];
        assignPatientsToUser(u.uid, [assignedPatient.id]);
        changed = true;
      }
    });
    if (changed) setRegisteredUsers(getStoredUsers());
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPatients();
      const formattedPatients: Patient[] = data.map((p: any) => ({
        id: p.patient_id,
        patientUid: formatPatientUid(String(p.patient_id)),
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
      setReferralRecords(
        formattedPatients.map((p, i) => ({
          id: `ref-${p.id}`,
          patientId: p.id,
          patientUid: p.patientUid || p.id,
          hospital: i % 2 === 0 ? 'MetroCare External' : 'NorthCare Hospital',
          status: i % 2 === 0 ? 'RECEIVED' : 'IN_REVIEW',
          summary: 'Previous hospital shared history, labs and discharge note.',
          reports: [
            { title: 'CBC Lab', source: 'External Lab', date: new Date().toISOString() },
            { title: 'Discharge Summary', source: 'Previous Hospital', date: new Date().toISOString() }
          ]
        }))
      );
      syncAssignments(formattedPatients);
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients. Make sure backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    if (!currentUser) return;
    const allowedIds = scopedPatients.map((p) => p.id);
    if (currentUser.role !== 'ADMIN' && !allowedIds.includes(patientId)) {
      setError('Access denied: patient is not assigned to your account.');
      return;
    }
    try {
      const data = await fetchPatient(patientId);
      const formattedPatient: Patient = {
        id: data.patient_id,
        patientUid: formatPatientUid(String(data.patient_id)),
        name: data.name,
        age: data.age,
        gender: data.gender,
        condition: data.condition,
        room: data.room,
        patientType: data.care_mode === 'live_monitoring' ? 'MONITORED' : 'CONTEXT_ONLY',
        history:
          data.vitals?.map((v: any) => ({
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
          medications:
            data.medications?.map((m: any) => ({
              id: m.medication_id,
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              route: m.route,
              timing: m.timing
            })) || [],
          doctorInstructions:
            data.instructions?.map((i: any) => ({
              id: i.instruction_id,
              instruction: i.instruction_text,
              priority: i.priority.toUpperCase(),
              dueTime: i.due_time,
              createdAt: i.created_at,
              createdBy: i.created_by
            })) || [],
          reports:
            data.reports?.map((r: any) => ({
              id: r.report_id,
              url: '',
              uploadedAt: r.uploaded_at,
              extractedData: r.extracted_text,
              type: r.report_type,
              reportName: r.file_name,
              findings: r.findings
            })) || [],
          messages:
            data.messages?.map((m: any) => ({
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
      addAudit('Viewed patient record', `${formattedPatient.name} (${formattedPatient.patientUid})`);
    } catch (err: any) {
      console.error('Error loading patient details:', err);
      setError('Failed to load patient details');
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetails(selectedPatientId);
    } else {
      setSelectedPatient(null);
    }
  }, [selectedPatientId, currentUser, scopedPatients.length]);

  const handlePatientUpdate = async (updatedPatient: Patient) => {
    await loadPatientDetails(updatedPatient.id);
    await loadPatients();
  };

  const handleAddPatient = async (newPatient: Omit<Patient, 'id' | 'lastUpdated'>) => {
    try {
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
      await loadPatients();
      addAudit('Created patient record', newPatient.name);
    } catch (err: any) {
      console.error('Error adding patient:', err);
      alert('Failed to add patient. Make sure backend is running.');
    }
  };

  const handleSendTeamMessage = (payload: { message: string; toUid: string | 'ALL' }) => {
    if (!currentUser) return;
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      fromUid: currentUser.uid,
      toUid: payload.toUid,
      role: currentUser.role,
      userName: currentUser.name,
      message: payload.message,
      timestamp: new Date().toISOString()
    };
    setTeamMessages((prev) => [...prev, newMessage]);
    addAudit('Sent staff message', payload.toUid);
  };

  const grantConsent = (payload: {
    granteeType: 'HOSPITAL' | 'DOCTOR';
    granteeName: string;
    duration: ConsentDuration;
  }) => {
    if (!currentUser) return;
    const createdAt = new Date().toISOString();
    const record: ConsentRecord = {
      id: Date.now().toString(),
      patientName: currentUser.name,
      granteeType: payload.granteeType,
      granteeName: payload.granteeName,
      duration: payload.duration,
      createdAt,
      expiresAt: getConsentExpiry(createdAt, payload.duration),
      status: 'ACTIVE',
      transactionHash: createTransactionId(`${currentUser.name}-${payload.granteeName}`)
    };
    setConsents((prev) => [record, ...prev]);
    addAudit('Granted consent', `${payload.granteeType}:${payload.granteeName}`);
  };

  const handleVerificationLogged = (proof: BlockchainRecordProof) => {
    setVerificationLog((prev) => [proof, ...prev]);
    addAudit('Blockchain verification', proof.patientName, proof.status);
  };

  const handleNavigate = (page: AppPage) => {
    if (!currentUser || !canAccessPage(currentUser.role, page)) return;
    setActivePage(page);
    setSelectedPatientId(null);
  };

  const handleApproveUser = (email: string, role: 'DOCTOR' | 'NURSE') => {
    approveUser(email, role);
    setRegisteredUsers(getStoredUsers());
    syncAssignments(patients);
    addAudit('Approved staff account', `${role}:${email}`);
  };

  const renderActivePage = () => {
    if (!currentUser) return null;
    if (activePage === 'CONSENT') {
      return <ConsentManagementPage currentUser={currentUser} consents={consents} onGrantConsent={grantConsent} />;
    }
    if (activePage === 'PATIENT_PANEL') {
      return (
        <PatientPanelPage
          currentUser={currentUser}
          patients={scopedPatients}
          onOpenPatient={setSelectedPatientId}
          referralRecords={referralRecords.filter((r) => scopedPatients.some((p) => p.id === r.patientId))}
        />
      );
    }
    if (activePage === 'BLOCKCHAIN_VERIFY') {
      return <BlockchainVerificationPage currentUser={currentUser} patients={scopedPatients} onVerificationLogged={handleVerificationLogged} />;
    }
    if (activePage === 'AUDIT_LOG') {
      return <AuditTrailPage currentUser={currentUser} auditEntries={auditEntries} />;
    }
    if (activePage === 'INTEROPERABILITY') {
      return (
        <InteroperabilitySimulationPage
          currentUser={currentUser}
          patients={patients}
          consents={consents}
          referralRecords={referralRecords}
          onLogAction={(action, target) => addAudit(action, target)}
        />
      );
    }
    if (activePage === 'AI_INSIGHTS') {
      return <AIInsightsPage patients={scopedPatients} />;
    }
    return (
      <Dashboard
        patients={scopedPatients}
        currentUser={currentUser}
        staff={registeredUsers}
        teamMessages={teamMessages}
        onPatientClick={setSelectedPatientId}
        onAddPatient={handleAddPatient}
        onSendTeamMessage={handleSendTeamMessage}
        pendingUsers={registeredUsers.filter((u) => u.approvalStatus === 'PENDING' && (u.role === 'DOCTOR' || u.role === 'NURSE'))}
        onApproveUser={handleApproveUser}
      />
    );
  };

  if (!currentUser) {
    return (
      <RoleSelection
        onRoleSelect={(user) => {
          setCurrentUser(user);
          setRegisteredUsers(getStoredUsers());
          setActivePage(user.role === 'PATIENT' ? 'PATIENT_PANEL' : 'DASHBOARD');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navigation currentUser={currentUser} activePage={activePage} onNavigate={handleNavigate} onLogout={() => {
        addAudit('Logged out', currentUser.role);
        setCurrentUser(null);
        setSelectedPatientId(null);
        setActivePage('DASHBOARD');
      }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">{error}</p>
            <p className="text-red-600 text-sm mt-1">Make sure the backend is running: <code>cd backend && npm start</code></p>
            <button onClick={loadPatients} className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-slate-600 animate-spin" />
            <span className="ml-4 text-slate-500 text-lg">Loading patient data...</span>
          </div>
        ) : selectedPatient && currentUser.role !== 'ADMIN' ? (
          <PatientDetail patient={selectedPatient} currentUser={currentUser} onBack={() => setSelectedPatientId(null)} onUpdatePatient={handlePatientUpdate} />
        ) : (
          renderActivePage()
        )}
      </main>
    </div>
  );
};

export default App;
