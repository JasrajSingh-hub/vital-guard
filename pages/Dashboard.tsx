import React, { useState, useMemo } from 'react';
import { Patient, RiskLevel, User } from '../types';
import PatientCard from '../components/PatientCard';
import TasksModal from '../components/TasksModal';
import AddPatientForm from '../components/AddPatientForm';
import { Search, Filter, Plus, Bell } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  currentUser: User;
  onPatientClick: (id: string) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'lastUpdated'>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, currentUser, onPatientClick, onAddPatient }) => {
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  
  const isNurse = currentUser.role === 'NURSE';

  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => filter === 'ALL' || p.riskLevel === filter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.room.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        // Sort Priority: Critical > Attention > Stable
        const riskScore = { 'CRITICAL': 3, 'ATTENTION': 2, 'STABLE': 1 };
        return riskScore[b.riskLevel] - riskScore[a.riskLevel];
      });
  }, [patients, filter, search]);

  const counts = useMemo(() => {
    return {
      all: patients.length,
      critical: patients.filter(p => p.riskLevel === 'CRITICAL').length,
      attention: patients.filter(p => p.riskLevel === 'ATTENTION').length,
      stable: patients.filter(p => p.riskLevel === 'STABLE').length,
    };
  }, [patients]);

  const handleAddPatient = (newPatient: Omit<Patient, 'id' | 'lastUpdated'>) => {
    onAddPatient(newPatient);
    setShowAddPatient(false);
  };

  const handleTaskComplete = (taskId: string, completedBy: string) => {
    console.log('Task completed:', taskId, 'by', completedBy);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Patient Overview</h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Bell className="w-4 h-4 mr-2" />
            {showTasks ? 'Hide Tasks' : 'Show Tasks'}
          </button>
          {isNurse && (
            <button
              onClick={() => setShowAddPatient(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <div className="relative rounded-md shadow-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="Search patient or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats / Filter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setFilter('ALL')}
          className={`p-4 rounded-lg border ${filter === 'ALL' ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200 bg-white'} text-left transition-all hover:shadow-md`}
        >
          <div className="text-sm font-medium text-gray-500">Total Patients</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{counts.all}</div>
        </button>
        <button 
          onClick={() => setFilter('CRITICAL')}
          className={`p-4 rounded-lg border ${filter === 'CRITICAL' ? 'ring-2 ring-red-500 border-transparent' : 'border-red-100 bg-red-50'} text-left transition-all hover:shadow-md`}
        >
          <div className="text-sm font-medium text-red-600">Critical</div>
          <div className="mt-1 text-2xl font-semibold text-red-900">{counts.critical}</div>
        </button>
        <button 
          onClick={() => setFilter('ATTENTION')}
          className={`p-4 rounded-lg border ${filter === 'ATTENTION' ? 'ring-2 ring-yellow-500 border-transparent' : 'border-yellow-100 bg-yellow-50'} text-left transition-all hover:shadow-md`}
        >
          <div className="text-sm font-medium text-yellow-600">Needs Attention</div>
          <div className="mt-1 text-2xl font-semibold text-yellow-900">{counts.attention}</div>
        </button>
        <button 
          onClick={() => setFilter('STABLE')}
          className={`p-4 rounded-lg border ${filter === 'STABLE' ? 'ring-2 ring-green-500 border-transparent' : 'border-green-100 bg-green-50'} text-left transition-all hover:shadow-md`}
        >
          <div className="text-sm font-medium text-green-600">Stable</div>
          <div className="mt-1 text-2xl font-semibold text-green-900">{counts.stable}</div>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map(patient => (
          <PatientCard key={patient.id} patient={patient} onClick={onPatientClick} />
        ))}
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <AddPatientForm
          onSubmit={handleAddPatient}
          onCancel={() => setShowAddPatient(false)}
        />
      )}

      {/* Tasks Modal */}
      {showTasks && (
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
