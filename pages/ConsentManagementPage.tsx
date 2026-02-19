import React, { useMemo, useState } from 'react';
import { ConsentDuration, ConsentRecord, User } from '../types';
import { ShieldCheck, ShieldX } from 'lucide-react';

interface ConsentManagementPageProps {
  currentUser: User;
  consents: ConsentRecord[];
  onGrantConsent: (payload: {
    granteeType: 'HOSPITAL' | 'DOCTOR';
    granteeName: string;
    duration: ConsentDuration;
  }) => void;
}

const ConsentManagementPage: React.FC<ConsentManagementPageProps> = ({
  currentUser,
  consents,
  onGrantConsent
}) => {
  const [granteeType, setGranteeType] = useState<'HOSPITAL' | 'DOCTOR'>('HOSPITAL');
  const [granteeName, setGranteeName] = useState('City General Hospital');
  const [duration, setDuration] = useState<ConsentDuration>('24H');

  const granteeOptions = {
    HOSPITAL: ['City General Hospital', 'MetroCare Clinic', 'Regional Health Center'],
    DOCTOR: ['Dr. Meera Shah', 'Dr. Rohan Patel', 'Dr. Alan Brooks']
  };

  const activeConsents = useMemo(
    () => consents.filter((c) => c.status === 'ACTIVE'),
    [consents]
  );
  const expiredConsents = useMemo(
    () => consents.filter((c) => c.status === 'EXPIRED' || c.status === 'REVOKED'),
    [consents]
  );

  if (currentUser.role !== 'PATIENT') {
    return (
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Consent Management</h1>
        <p className="text-slate-600 mt-2">Only patients can manage consent records.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Consent Management</h1>
        <p className="text-sm text-slate-600 mt-1">
          Patient-controlled access. Each consent action is logged on blockchain.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Grant New Consent</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={granteeType}
            onChange={(e) => {
              const next = e.target.value as 'HOSPITAL' | 'DOCTOR';
              setGranteeType(next);
              setGranteeName(granteeOptions[next][0]);
            }}
            className="px-3 py-2 rounded-md border border-slate-300"
          >
            <option value="HOSPITAL">Hospital</option>
            <option value="DOCTOR">Doctor</option>
          </select>
          <select
            value={granteeName}
            onChange={(e) => setGranteeName(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-300"
          >
            {granteeOptions[granteeType].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value as ConsentDuration)}
            className="px-3 py-2 rounded-md border border-slate-300"
          >
            <option value="24H">24 hours</option>
            <option value="7D">7 days</option>
            <option value="PERMANENT">Permanent</option>
          </select>
          <button
            onClick={() => onGrantConsent({ granteeType, granteeName, duration })}
            className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800"
          >
            Grant Consent
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Consents</h2>
        <div className="space-y-3">
          {activeConsents.length === 0 && <p className="text-sm text-slate-500">No active consents.</p>}
          {activeConsents.map((consent) => (
            <article key={consent.id} className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{consent.granteeName}</p>
                  <p className="text-sm text-slate-600">
                    {consent.granteeType} | Duration: {consent.duration}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tx: {consent.transactionHash} | Created: {new Date(consent.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-200 text-emerald-900">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Expired / Revoked Consents</h2>
        <div className="space-y-3">
          {expiredConsents.length === 0 && <p className="text-sm text-slate-500">No expired or revoked consents.</p>}
          {expiredConsents.map((consent) => (
            <article key={consent.id} className="border border-slate-300 bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{consent.granteeName}</p>
                  <p className="text-xs text-slate-500">Tx: {consent.transactionHash}</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-200 text-slate-700">
                  <ShieldX className="w-3 h-3 mr-1" />
                  {consent.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConsentManagementPage;
