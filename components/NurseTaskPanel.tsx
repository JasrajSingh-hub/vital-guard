import React, { useMemo } from 'react';
import { Patient, NurseTask, TaskStatus, TaskPriority, User } from '../types';
import { CheckCircle, Clock, AlertTriangle, Bell } from 'lucide-react';

interface NurseTaskPanelProps {
  patients: Patient[];
  currentUser: User;
  onTaskComplete: (taskId: string, completedBy: string) => void;
}

const NurseTaskPanel: React.FC<NurseTaskPanelProps> = ({ patients, currentUser, onTaskComplete }) => {
  // Generate tasks from patient context
  const tasks = useMemo(() => {
    const allTasks: NurseTask[] = [];
    
    patients.forEach(patient => {
      if (!patient.context) return;
      
      // Generate tasks from doctor instructions
      patient.context.doctorInstructions.forEach(instruction => {
        const task: NurseTask = {
          id: `inst-${instruction.id}`,
          patientId: patient.id,
          patientName: patient.name,
          description: instruction.instruction,
          priority: instruction.priority,
          status: 'PENDING',
          dueTime: instruction.dueTime,
          createdAt: instruction.createdAt,
          sourceType: 'DOCTOR_INSTRUCTION',
          sourceId: instruction.id
        };
        allTasks.push(task);
      });
      
      // Generate tasks from medications
      patient.context.medications.forEach(med => {
        const task: NurseTask = {
          id: `med-${med.id}`,
          patientId: patient.id,
          patientName: patient.name,
          description: `Administer ${med.name} - ${med.dosage} (${med.route})${med.timing ? ` - ${med.timing}` : ''}`,
          priority: 'MEDIUM',
          status: 'PENDING',
          dueTime: med.timing,
          createdAt: new Date().toISOString(),
          sourceType: 'MEDICATION',
          sourceId: med.id
        };
        allTasks.push(task);
      });
    });
    
    // Sort by priority and due time
    return allTasks.sort((a, b) => {
      const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityScore[b.priority] - priorityScore[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime);
      }
      return 0;
    });
  }, [patients]);

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const highPriorityCount = pendingTasks.filter(t => t.priority === 'HIGH').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Bell className="w-6 h-6 mr-2 text-blue-500" />
          Nurse Tasks & Notifications
        </h2>
        <div className="flex items-center space-x-2">
          {highPriorityCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
              {highPriorityCount} High Priority
            </span>
          )}
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
            {pendingTasks.length} Pending
          </span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These are care coordination tasks, not clinical risk alerts. 
          Tasks are informational and require manual execution.
        </p>
      </div>

      <div className="space-y-3">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No pending tasks. All care actions are up to date!</p>
          </div>
        ) : (
          pendingTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border-l-4 ${
                task.priority === 'HIGH' 
                  ? 'bg-red-50 border-red-500' 
                  : task.priority === 'MEDIUM'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      task.priority === 'HIGH' 
                        ? 'bg-red-200 text-red-900' 
                        : task.priority === 'MEDIUM'
                        ? 'bg-yellow-200 text-yellow-900'
                        : 'bg-blue-200 text-blue-900'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {task.patientName}
                    </span>
                    {task.dueTime && (
                      <span className="flex items-center text-xs text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.dueTime}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-800 mb-2">{task.description}</p>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="capitalize">
                      {task.sourceType.replace('_', ' ').toLowerCase()}
                    </span>
                    <span>•</span>
                    <span>{new Date(task.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onTaskComplete(task.id, currentUser.name)}
                  disabled={currentUser.role !== 'NURSE'}
                  className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title={currentUser.role !== 'NURSE' ? 'Only nurses can complete tasks' : 'Mark as complete'}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NurseTaskPanel;
