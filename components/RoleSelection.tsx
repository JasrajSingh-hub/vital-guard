import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Stethoscope, Heart, UserCircle } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelect: (user: User) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && name.trim()) {
      onRoleSelect({ role: selectedRole, name: name.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VitalGuard AI</h1>
          <p className="text-gray-600">Healthcare Monitoring & Care Coordination System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('DOCTOR')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  selectedRole === 'DOCTOR'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                }`}
              >
                <Stethoscope className={`w-8 h-8 mb-3 ${
                  selectedRole === 'DOCTOR' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-bold text-lg text-gray-900">Doctor</div>
                <div className="text-sm text-gray-600 mt-1">
                  View patient status, add instructions, communicate with nurses
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('NURSE')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  selectedRole === 'NURSE'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                }`}
              >
                <UserCircle className={`w-8 h-8 mb-3 ${
                  selectedRole === 'NURSE' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="font-bold text-lg text-gray-900">Nurse</div>
                <div className="text-sm text-gray-600 mt-1">
                  Enter vitals, complete tasks, respond to doctor instructions
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!selectedRole || !name.trim()}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue as {selectedRole || 'User'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Note:</strong> This is a demonstration system. Role selection is for UI customization only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
