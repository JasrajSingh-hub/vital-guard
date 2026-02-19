import React from 'react';
import { Patient, User } from '../types';
import { Clock, Pill, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

interface NurseTaskViewProps {
  patient: Patient;
  currentUser: User;
  onTaskComplete: (taskId: string) => void;
}

const NurseTaskView: React.FC<NurseTaskViewProps> = ({ patient, currentUser, onTaskComplete }) => {
  const context = patient.context || {
    medications: [],
    doctorInstructions: [],
    diagnosis: '',
    reports: [],
  };

  const pendingInstructions = context.doctorInstructions || [];
  const medications = context.medications || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">What Needs To Be Done</h3>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
          NURSE ACTION
        </span>
      </div>

      {/* Pending Doctor Instructions */}
      {pendingInstructions.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-orange-300 p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h4 className="font-bold text-gray-900">Doctor Instructions ({pendingInstructions.length})</h4>
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded">
              DOCTOR INSTRUCTION
            </span>
          </div>
          <div className="space-y-2">
            {pendingInstructions.map(inst => (
              <div
                key={inst.id}
                className={`p-3 rounded-lg border-l-4 ${
                  inst.priority === 'HIGH'
                    ? 'bg-red-50 border-red-500'
                    : inst.priority === 'MEDIUM'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          inst.priority === 'HIGH'
                            ? 'bg-red-200 text-red-900'
                            : inst.priority === 'MEDIUM'
                            ? 'bg-yellow-200 text-yellow-900'
                            : 'bg-blue-200 text-blue-900'
                        }`}
                      >
                        {inst.priority}
                      </span>
                      {inst.dueTime && (
                        <span className="flex items-center text-xs text-gray-600 font-semibold">
                          <Clock className="w-3 h-3 mr-1" />
                          Due: {inst.dueTime}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{inst.instruction}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By {inst.createdBy} • {new Date(inst.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onTaskComplete(`inst-${inst.id}`)}
                    className="ml-3 px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications Due */}
      {medications.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-green-300 p-4">
          <div className="flex items-center mb-3">
            <Pill className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-bold text-gray-900">Medications ({medications.length})</h4>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">
              MEDICATION TASK
            </span>
          </div>
          <div className="space-y-2">
            {medications.map(med => (
              <div key={med.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{med.name}</div>
                    <div className="text-sm text-gray-700 mt-1">
                      <span className="font-semibold">Dosage:</span> {med.dosage} •{' '}
                      <span className="font-semibold">Route:</span> {med.route} •{' '}
                      <span className="font-semibold">Frequency:</span> {med.frequency}
                    </div>
                    {med.timing && (
                      <div className="text-xs text-gray-600 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {med.timing}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onTaskComplete(`med-${med.id}`)}
                    className="ml-3 px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Given
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Tasks */}
      {pendingInstructions.length === 0 && medications.length === 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <p className="text-gray-600 font-semibold">No pending tasks for this patient</p>
          <p className="text-sm text-gray-500 mt-1">All care actions are up to date</p>
        </div>
      )}

      {/* Upload Report Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 p-4">
        <div className="flex items-start">
          <FileText className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-1">Upload Report or Prescription</h4>
            <p className="text-sm text-gray-700 mb-2">
              AI will extract medications and instructions automatically
            </p>
            <p className="text-xs text-gray-600 italic">
              Note: This is patient context data, not live vitals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseTaskView;
