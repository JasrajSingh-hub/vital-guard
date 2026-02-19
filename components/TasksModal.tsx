import React from 'react';
import { Patient, User } from '../types';
import { X } from 'lucide-react';
import NurseTaskPanel from './NurseTaskPanel';

interface TasksModalProps {
  patients: Patient[];
  currentUser: User;
  onClose: () => void;
  onTaskComplete: (taskId: string, completedBy: string) => void;
}

const TasksModal: React.FC<TasksModalProps> = ({ patients, currentUser, onClose, onTaskComplete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Nurse Tasks & Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <NurseTaskPanel 
            patients={patients} 
            currentUser={currentUser} 
            onTaskComplete={onTaskComplete}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksModal;
