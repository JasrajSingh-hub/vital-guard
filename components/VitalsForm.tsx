import React, { useState } from 'react';
import { Vitals } from '../types';
import { Save, Loader2 } from 'lucide-react';

interface VitalsFormProps {
  onSubmit: (vitals: Omit<Vitals, 'timestamp'>) => void;
  isAnalyzing: boolean;
}

const VitalsForm: React.FC<VitalsFormProps> = ({ onSubmit, isAnalyzing }) => {
  const [form, setForm] = useState({
    heartRate: '',
    systolicBp: '',
    diastolicBp: '',
    spO2: '',
    respRate: '',
    temperature: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      heartRate: Number(form.heartRate),
      systolicBp: Number(form.systolicBp),
      diastolicBp: Number(form.diastolicBp),
      spO2: Number(form.spO2),
      respRate: Number(form.respRate),
      temperature: Number(form.temperature),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Vitals</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
          <input required type="number" name="heartRate" value={form.heartRate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="75" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">BP Systolic</label>
          <input required type="number" name="systolicBp" value={form.systolicBp} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="120" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">BP Diastolic</label>
          <input required type="number" name="diastolicBp" value={form.diastolicBp} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="80" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SpO2 (%)</label>
          <input required type="number" name="spO2" value={form.spO2} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="98" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Resp. Rate (/min)</label>
          <input required type="number" name="respRate" value={form.respRate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="16" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temp (°C)</label>
          <input required type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" placeholder="37.0" />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Analyze Risk with AI...
            </>
          ) : (
            <>
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save & Analyze
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default VitalsForm;
