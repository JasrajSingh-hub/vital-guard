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
  const canAct = currentUser.role === 'NURSE';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col">
        <div className="bg-slate-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Pill className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-xl font-semibold">Medications and Instructions</h2>
              <p className="text-sm text-slate-200">Patient: {patient.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-slate-600 rounded-full p-2 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white border-b border-slate-200 px-6 flex">
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-6 py-3 font-semibold text-sm ${
              activeTab === 'medications'
                ? 'text-emerald-700 border-b-2 border-emerald-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center">
              <Pill className="w-4 h-4 mr-2" />
              Medications ({medications.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-6 py-3 font-semibold text-sm ${
              activeTab === 'instructions'
                ? 'text-amber-700 border-b-2 border-amber-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Instructions ({instructions.length})
            </div>
          </button>
        </div>

        <div className="border-b px-6 py-3 bg-slate-100 border-slate-200">
          <p className="text-sm font-semibold text-slate-700">
            {canAct ? 'Nurse action enabled for medication/task completion.' : 'Read-only mode for this role.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'medications' ? (
            medications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Pill className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="font-semibold">No medications recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pill className="w-5 h-5 text-emerald-700" />
                      <h3 className="text-lg font-semibold text-slate-900">{med.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <span className="text-xs text-slate-500 font-semibold">Dosage</span>
                        <p className="text-sm font-medium text-slate-900">{med.dosage}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold">Route</span>
                        <p className="text-sm font-medium text-slate-900 capitalize">{med.route}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-semibold">Frequency</span>
                        <p className="text-sm font-medium text-slate-900">{med.frequency}</p>
                      </div>
                      {med.timing && (
                        <div>
                          <span className="text-xs text-slate-500 font-semibold">Timing</span>
                          <p className="text-sm font-medium text-slate-900 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {med.timing}
                          </p>
                        </div>
                      )}
                    </div>
                    {canAct && (
                      <button className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800">
                        Mark as Given
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : instructions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="font-semibold">No instructions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instructions.map((inst) => (
                <div
                  key={inst.id}
                  className={`p-4 rounded-lg border ${
                    inst.priority === 'HIGH'
                      ? 'bg-red-50 border-red-300'
                      : inst.priority === 'MEDIUM'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-sky-50 border-sky-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        inst.priority === 'HIGH'
                          ? 'text-red-700'
                          : inst.priority === 'MEDIUM'
                          ? 'text-amber-700'
                          : 'text-sky-700'
                      }`}
                    />
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-white/80">{inst.priority}</span>
                    {inst.dueTime && (
                      <span className="text-xs text-slate-600 font-semibold flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Due: {inst.dueTime}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-2">{inst.instruction}</p>
                  <p className="text-xs text-slate-500 mb-3">
                    By {inst.createdBy} | {new Date(inst.createdAt).toLocaleString()}
                  </p>
                  {canAct && (
                    <button
                      className={`px-4 py-2 text-white text-sm font-semibold rounded-lg ${
                        inst.priority === 'HIGH'
                          ? 'bg-red-700 hover:bg-red-800'
                          : inst.priority === 'MEDIUM'
                          ? 'bg-amber-700 hover:bg-amber-800'
                          : 'bg-sky-700 hover:bg-sky-800'
                      }`}
                    >
                      Mark as Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationsDrawer;
