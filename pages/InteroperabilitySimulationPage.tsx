import React, { useMemo, useState } from 'react';
import { ConsentRecord, Patient, ReferralRecord, User } from '../types';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface InteroperabilitySimulationPageProps {
  currentUser: User;
  patients: Patient[];
  consents: ConsentRecord[];
  referralRecords: ReferralRecord[];
  onLogAction: (action: string, target: string) => void;
}

const InteroperabilitySimulationPage: React.FC<InteroperabilitySimulationPageProps> = ({
  currentUser,
  patients,
  consents,
  referralRecords,
  onLogAction
}) => {
  const [hospital, setHospital] = useState('Metro Hospital Network');
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [stage, setStage] = useState<'idle' | 'requesting' | 'validated' | 'granted'>('idle');

  const selectedPatient = useMemo(() => patients.find((p) => p.id === patientId), [patients, patientId]);
  const hasConsent = useMemo(() => {
    if (!selectedPatient) return false;
    return consents.some(
      (c) =>
        c.status === 'ACTIVE' &&
        c.patientName === selectedPatient.name &&
        (c.granteeName === hospital || c.granteeType === 'HOSPITAL')
    );
  }, [consents, hospital, selectedPatient]);

  if (currentUser.role !== 'ADMIN') {
    return (
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Interoperability Simulation</h1>
        <p className="text-slate-600 mt-2">This page is available for Admin role only.</p>
      </section>
    );
  }

  const requestFlow = async () => {
    if (!selectedPatient) return;
    setStage('requesting');
    await new Promise((r) => setTimeout(r, 700));
    setStage('validated');
    await new Promise((r) => setTimeout(r, 700));
    if (hasConsent) {
      setStage('granted');
      onLogAction('Shared record with external hospital', `${selectedPatient.name} -> ${hospital}`);
    } else {
      setStage('idle');
      onLogAction('Interoperability denied (no consent)', `${selectedPatient.name} -> ${hospital}`);
      alert('Consent validation failed. No active consent for selected transfer.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Interoperability Simulation</h1>
        <p className="text-sm text-slate-600 mt-1">
          Simulate secure record sharing across hospitals with consent validation.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-300"
          >
            <option>Metro Hospital Network</option>
            <option>NorthCare Medical Group</option>
            <option>Central Health Exchange</option>
          </select>
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
          <button
            onClick={requestFlow}
            className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800"
          >
            Request Access
          </button>
        </div>

        <div className="mt-5 p-4 rounded-lg border border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-700">Flow: Select Hospital -&gt; Request Access -&gt; Consent Validation -&gt; Access Result</p>
          <div className="mt-3 text-sm">
            {stage === 'idle' && <span className="text-slate-600">Ready to run simulation.</span>}
            {stage === 'requesting' && (
              <span className="text-blue-700 inline-flex items-center">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Sending interoperability request...
              </span>
            )}
            {stage === 'validated' && <span className="text-amber-700">Consent validation in progress...</span>}
            {stage === 'granted' && (
              <span className="text-emerald-700 inline-flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Access granted and logged on blockchain reference.
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Interoperable / Referred Patients</h2>
        <div className="space-y-2">
          {referralRecords.map((r) => (
            <div key={r.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm">
              <p className="font-semibold text-slate-900">{r.patientUid} | {r.hospital} | {r.status}</p>
              <p className="text-slate-600">{r.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InteroperabilitySimulationPage;
