import React, { useMemo, useState } from 'react';
import { Patient } from '../types';
import { AlertTriangle, Brain, Gauge, Sparkles } from 'lucide-react';

interface AIInsightsPageProps {
  patients: Patient[];
}

const riskPercent = {
  CRITICAL: 90,
  ATTENTION: 60,
  STABLE: 30
} as const;

const AIInsightsPage: React.FC<AIInsightsPageProps> = ({ patients }) => {
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const patient = useMemo(() => patients.find((p) => p.id === patientId), [patients, patientId]);

  const latest = patient?.history?.[patient.history.length - 1];
  const abnormal = useMemo(() => {
    if (!latest) return [];
    const flags: string[] = [];
    if (latest.heartRate > 110 || latest.heartRate < 50) flags.push(`Heart rate ${latest.heartRate} bpm`);
    if (latest.spO2 < 92) flags.push(`SpO2 ${latest.spO2}%`);
    if (latest.temperature > 38) flags.push(`Temperature ${latest.temperature} C`);
    if (latest.systolicBp > 150) flags.push(`Systolic BP ${latest.systolicBp}`);
    return flags;
  }, [latest]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">AI Insights</h1>
        <p className="text-sm text-slate-600 mt-1">
          AI patient summary, risk scoring, and abnormal vital signal detection.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="px-3 py-2 rounded-md border border-slate-300"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </section>

      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Gauge className="w-5 h-5 mr-2 text-blue-700" />
              Risk Meter
            </h2>
            <div className="mt-4">
              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full ${
                    patient.riskLevel === 'CRITICAL'
                      ? 'bg-red-600'
                      : patient.riskLevel === 'ATTENTION'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${riskPercent[patient.riskLevel]}%`, transition: 'width 0.6s ease' }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Current AI Risk: <strong>{patient.riskLevel}</strong> ({riskPercent[patient.riskLevel]}%)
              </p>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
              Abnormal Vitals
            </h2>
            <div className="mt-3 space-y-2">
              {abnormal.length === 0 && <p className="text-sm text-slate-600">No abnormal vitals detected.</p>}
              {abnormal.map((item) => (
                <div key={item} className="px-3 py-2 text-sm rounded bg-amber-50 border border-amber-200 text-amber-800">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-teal-700" />
              AI Summary Card
            </h2>
            <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-semibold bg-teal-100 text-teal-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-GENERATED
            </span>
            <p className="mt-3 text-sm text-slate-700">
              {patient.aiAnalysis || 'AI summary pending. Add vitals and context to generate richer insight.'}
            </p>
          </section>
        </div>
      )}
    </div>
  );
};

export default AIInsightsPage;
