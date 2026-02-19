import React from 'react';
import { Patient, RiskLevel } from '../types';
import { Heart, Activity, Thermometer, Wind, AlertCircle } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
  onClick: (id: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const latest = patient.history[patient.history.length - 1];
  const isContextOnly = patient.patientType === 'CONTEXT_ONLY';

  const getStatusColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'ATTENTION': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'STABLE': return 'bg-green-50 border-green-200 hover:bg-green-100';
      default: return 'bg-white border-gray-200';
    }
  };

  const getStatusBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">CRITICAL</span>;
      case 'ATTENTION': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white">ATTENTION</span>;
      case 'STABLE': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">STABLE</span>;
    }
  };

  return (
    <div 
      onClick={() => onClick(patient.id)}
      className={`border rounded-lg shadow-sm p-4 cursor-pointer transition-all duration-200 ${getStatusColor(patient.riskLevel)}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
          <p className="text-sm text-gray-500">{patient.condition}</p>
          <p className="text-xs text-gray-400 mt-1">Room: {patient.room}</p>
          {isContextOnly && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
              Care Coordination
            </span>
          )}
        </div>
        {getStatusBadge(patient.riskLevel)}
      </div>

      {isContextOnly ? (
        <div className="space-y-2">
          {patient.context?.medications && patient.context.medications.length > 0 && (
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{patient.context.medications.length}</span> medication(s)
            </div>
          )}
          {patient.context?.doctorInstructions && patient.context.doctorInstructions.length > 0 && (
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{patient.context.doctorInstructions.length}</span> instruction(s)
            </div>
          )}
          {patient.context?.diagnosis && (
            <div className="text-xs text-gray-600 mt-2 line-clamp-2">
              {patient.context.diagnosis}
            </div>
          )}
        </div>
      ) : latest ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{latest.heartRate} <span className="text-gray-500 text-xs">bpm</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{latest.systolicBp}/{latest.diastolicBp} <span className="text-gray-500 text-xs">mmHg</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium">{latest.spO2}% <span className="text-gray-500 text-xs">SpO2</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">{latest.temperature}°C</span>
            </div>
          </div>

          {patient.aiAnalysis && (
            <div className="mt-3 p-2 bg-white/50 rounded text-xs text-gray-700 flex items-start">
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{patient.aiAnalysis}</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-500 italic">No vitals recorded yet</div>
      )}
    </div>
  );
};

export default PatientCard;
