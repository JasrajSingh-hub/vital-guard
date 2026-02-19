import React, { useState } from 'react';
import { Patient, User } from '../types';
import { X, Pill, Clock, FileText, AlertTriangle } from 'lucide-react';

interface MedicationsDrawerProps {
  patient: Patient;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

const MedicationsDrawer: React.FC<MedicationsDrawerProps> = ({
  patient,
  currentUser,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'medications' | 'instructions'>('medications');
  
  const medications = patient.context?.medications || [];
  const instructions = patient.context?.doctorInstructions || [];
  const isNurse = currentUser.role === 'NURSE';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Pill className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-xl font-bold">Medications & Instructions</h2>
              <p className="text-sm text-blue-100">Patient: {patient.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b-2 border-gray-200 px-6 flex">
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'medications'
                ? 'text-green-600 border-b-4 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Pill className="w-4 h-4 mr-2" />
              Medications ({medications.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'instructions'
                ? 'text-orange-600 border-b-4 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Doctor Instructions ({instructions.length})
            </div>
          </button>
        </div>

        {/* Permission Badge */}
        <div className={`border-b px-6 py-3 ${
          activeTab === 'medications' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${
              activeTab === 'medications' ? 'text-green-900' : 'text-orange-900'
            }`}>
              {isNurse ? '✅ NURSE ACTION: You can manage and complete tasks' : '👁️ READ ONLY: Doctor view'}
            </p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isNurse 
                ? activeTab === 'medications' ? 'bg-green-200 text-green-900' : 'bg-orange-200 text-orange-900'
                : 'bg-gray-200 text-gray-800'
            }`}>
              {isNurse ? 'NURSE ACTION' : 'READ ONLY'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'medications' ? (
            // Medications Tab
            medications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-semibold">No medications recorded</p>
                <p className="text-sm mt-1">Add medications to track patient prescriptions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map(med => (
                  <div key={med.id} className="p-4 bg-green-50 border-2 border-green-300 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Pill className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-bold text-gray-900">{med.name}</h3>
                          <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs font-bold rounded">
                            MEDICATION
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <span className="text-xs text-gray-500 font-semibold">Dosage:</span>
                            <p className="text-sm font-medium text-gray-900">{med.dosage}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 font-semibold">Route:</span>
                            <p className="text-sm font-medium text-gray-900 capitalize">{med.route}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 font-semibold">Frequency:</span>
                            <p className="text-sm font-medium text-gray-900">{med.frequency}</p>
                          </div>
                          {med.timing && (
                            <div>
                              <span className="text-xs text-gray-500 font-semibold">Timing:</span>
                              <p className="text-sm font-medium text-gray-900 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {med.timing}
                              </p>
                            </div>
                          )}
                        </div>

                        {isNurse && (
                          <button className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors">
                            ✓ Mark as Given
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Doctor Instructions Tab
            instructions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-semibold">No doctor instructions</p>
                <p className="text-sm mt-1">Doctor instructions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {instructions.map(inst => (
                  <div
                    key={inst.id}
                    className={`p-4 rounded-lg border-2 hover:shadow-md transition-shadow ${
                      inst.priority === 'HIGH'
                        ? 'bg-red-50 border-red-300'
                        : inst.priority === 'MEDIUM'
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-blue-50 border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            inst.priority === 'HIGH' ? 'text-red-600' :
                            inst.priority === 'MEDIUM' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            inst.priority === 'HIGH'
                              ? 'bg-red-200 text-red-900'
                              : inst.priority === 'MEDIUM'
                              ? 'bg-yellow-200 text-yellow-900'
                              : 'bg-blue-200 text-blue-900'
                          }`}>
                            {inst.priority} PRIORITY
                          </span>
                          {inst.dueTime && (
                            <span className="text-xs text-gray-600 font-semibold flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Due: {inst.dueTime}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-bold rounded">
                            DOCTOR INSTRUCTION
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                          {inst.instruction}
                        </p>

                        <div className="text-xs text-gray-500 mb-3">
                          <span className="font-semibold">By:</span> {inst.createdBy} • 
                          <span className="ml-1">{new Date(inst.createdAt).toLocaleString()}</span>
                        </div>

                        {isNurse && (
                          <button className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors ${
                            inst.priority === 'HIGH' ? 'bg-red-600 hover:bg-red-700' :
                            inst.priority === 'MEDIUM' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            'bg-blue-600 hover:bg-blue-700'
                          }`}>
                            ✓ Mark as Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationsDrawer;
