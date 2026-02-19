import React, { useState, useMemo } from 'react';
import { Patient, RiskLevel, StoredUser, TeamMessage, User } from '../types';
import PatientCard from '../components/PatientCard';
import TasksModal from '../components/TasksModal';
import AddPatientForm from '../components/AddPatientForm';
import TeamCommunicationPanel from '../components/TeamCommunicationPanel';
import AdminPanel from '../components/AdminPanel';
import { Search, Plus, Bell, ClipboardList } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  currentUser: User;
  staff: StoredUser[];
  teamMessages: TeamMessage[];
  onPatientClick: (id: string) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'lastUpdated'>) => void;
  onSendTeamMessage: (payload: { message: string; toUid: string | 'ALL' }) => void;
  pendingUsers: StoredUser[];
  onApproveUser: (email: string, role: 'DOCTOR' | 'NURSE') => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  patients,
  currentUser,
  staff,
  teamMessages,
  onPatientClick,
  onAddPatient,
  onSendTeamMessage,
  pendingUsers,
  onApproveUser
}) => {
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  const isNurse = currentUser.role === 'NURSE';
  const isAdmin = currentUser.role === 'ADMIN';
  const isPatient = currentUser.role === 'PATIENT';
  const roleTitle = {
    DOCTOR: 'Doctor Dashboard',
    NURSE: 'Nurse Dashboard',
    PATIENT: 'Patient Portal',
    ADMIN: 'Admin Dashboard'
  }[currentUser.role];

  const scopedPatients = useMemo(() => {
    if (isPatient) {
      return patients.slice(0, 1);
    }
    return patients;
  }, [isPatient, patients]);

  const filteredPatients = useMemo(() => {
    return scopedPatients
      .filter((p) => filter === 'ALL' || p.riskLevel === filter)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.room.toLowerCase().includes(search.toLowerCase()) ||
          (p.patientUid || '').toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const riskScore = { CRITICAL: 3, ATTENTION: 2, STABLE: 1 };
        return riskScore[b.riskLevel] - riskScore[a.riskLevel];
      });
  }, [scopedPatients, filter, search]);

  const counts = useMemo(() => {
    return {
      all: scopedPatients.length,
      critical: scopedPatients.filter((p) => p.riskLevel === 'CRITICAL').length,
      attention: scopedPatients.filter((p) => p.riskLevel === 'ATTENTION').length,
      stable: scopedPatients.filter((p) => p.riskLevel === 'STABLE').length
    };
  }, [scopedPatients]);

  const patientSelf = isPatient ? scopedPatients[0] : null;

  const handleAddPatient = (newPatient: Omit<Patient, 'id' | 'lastUpdated'>) => {
    onAddPatient(newPatient);
    setShowAddPatient(false);
  };

  const handleTaskComplete = (taskId: string, completedBy: string) => {
    console.log('Task completed:', taskId, 'by', completedBy);
  };

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <AdminPanel
          currentUser={currentUser}
          patients={patients}
          staffUsers={staff}
          pendingUsers={pendingUsers}
          onApproveUser={onApproveUser}
        />
        <TeamCommunicationPanel currentUser={currentUser} staff={staff} messages={teamMessages} onSendMessage={onSendTeamMessage} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{roleTitle}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {isPatient
              ? 'Track your care updates and communicate with the care team.'
              : 'Monitor patient status and coordinate care delivery.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isPatient && (
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4 mr-2" />
              {showTasks ? 'Hide Tasks' : 'Show Tasks'}
            </button>
          )}
          {isNurse && (
            <button
              onClick={() => setShowAddPatient(true)}
              className="flex items-center px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <div className="relative rounded-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
            placeholder={isPatient ? 'Search your records...' : 'Search patient UID, name, or room...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('ALL')}
          className={`p-4 rounded-lg border ${
            filter === 'ALL' ? 'ring-2 ring-slate-500 border-transparent' : 'border-slate-200 bg-white'
          } text-left transition-all`}
        >
          <div className="text-sm font-medium text-slate-600">Total</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{counts.all}</div>
        </button>
        <button
          onClick={() => setFilter('CRITICAL')}
          className={`p-4 rounded-lg border ${
            filter === 'CRITICAL' ? 'ring-2 ring-red-500 border-transparent' : 'border-red-200 bg-red-50'
          } text-left transition-all`}
        >
          <div className="text-sm font-medium text-red-700">Critical</div>
          <div className="mt-1 text-2xl font-semibold text-red-800">{counts.critical}</div>
        </button>
        <button
          onClick={() => setFilter('ATTENTION')}
          className={`p-4 rounded-lg border ${
            filter === 'ATTENTION'
              ? 'ring-2 ring-amber-500 border-transparent'
              : 'border-amber-200 bg-amber-50'
          } text-left transition-all`}
        >
          <div className="text-sm font-medium text-amber-700">Attention</div>
          <div className="mt-1 text-2xl font-semibold text-amber-800">{counts.attention}</div>
        </button>
        <button
          onClick={() => setFilter('STABLE')}
          className={`p-4 rounded-lg border ${
            filter === 'STABLE'
              ? 'ring-2 ring-emerald-500 border-transparent'
              : 'border-emerald-200 bg-emerald-50'
          } text-left transition-all`}
        >
          <div className="text-sm font-medium text-emerald-700">Stable</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-800">{counts.stable}</div>
        </button>
      </div>

      {isPatient && patientSelf && (
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900">My Health Status</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-slate-500">Condition</p>
              <p className="font-semibold text-slate-900">{patientSelf.condition}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-slate-500">Current Status</p>
              <p className="font-semibold text-slate-900">{patientSelf.riskLevel}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-slate-500">Room</p>
              <p className="font-semibold text-slate-900">{patientSelf.room}</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {filteredPatients.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <ClipboardList className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-700 font-medium">No matching patients found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={isAdmin ? () => {} : onPatientClick}
                />
              ))}
            </div>
          )}
        </div>
        <TeamCommunicationPanel currentUser={currentUser} staff={staff} messages={teamMessages} onSendMessage={onSendTeamMessage} />
      </div>

      {showAddPatient && (
        <AddPatientForm onSubmit={handleAddPatient} onCancel={() => setShowAddPatient(false)} />
      )}

      {showTasks && !isPatient && (
        <TasksModal
          patients={patients}
          currentUser={currentUser}
          onClose={() => setShowTasks(false)}
          onTaskComplete={handleTaskComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
