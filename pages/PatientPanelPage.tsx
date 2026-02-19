import React, { useMemo } from 'react';
import { Patient, ReferralRecord, User } from '../types';
import { ActivitySquare, FileHeart, ShieldCheck } from 'lucide-react';

interface PatientPanelPageProps {
  currentUser: User;
  patients: Patient[];
  referralRecords: ReferralRecord[];
  onOpenPatient: (id: string) => void;
}

const PatientPanelPage: React.FC<PatientPanelPageProps> = ({ currentUser, patients, referralRecords, onOpenPatient }) => {
  const patient = useMemo(() => patients[0] || null, [patients]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Patient Panel</h1>
        <p className="text-sm text-slate-600 mt-1">
          Welcome {currentUser.name}. You can view your health status and consent-related access.
        </p>
      </section>

      {!patient ? (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-slate-600">No patient record mapped yet.</p>
        </section>
      ) : (
        <>
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">My Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500">Condition</p>
                <p className="font-semibold text-slate-900">{patient.condition}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500">Status</p>
                <p className="font-semibold text-slate-900">{patient.riskLevel}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500">Room</p>
                <p className="font-semibold text-slate-900">{patient.room}</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onOpenPatient(patient.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300"
            >
              <ActivitySquare className="w-5 h-5 text-sky-700 mb-2" />
              <p className="font-semibold text-slate-900">My Medical Record</p>
              <p className="text-sm text-slate-600 mt-1">View vitals, medications, and status updates.</p>
            </button>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <FileHeart className="w-5 h-5 text-teal-700 mb-2" />
              <p className="font-semibold text-slate-900">Consent Control</p>
              <p className="text-sm text-slate-600 mt-1">Grant consent to hospital/doctor with duration control.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2" />
              <p className="font-semibold text-slate-900">Privacy</p>
              <p className="text-sm text-slate-600 mt-1">Your data access follows your active consents.</p>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Referred / Previous Hospital Records</h2>
            {referralRecords.length === 0 && <p className="text-sm text-slate-500">No referral records available.</p>}
            <div className="space-y-3">
              {referralRecords.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="font-semibold text-slate-900">{r.hospital} ({r.status})</p>
                  <p className="text-sm text-slate-600">{r.summary}</p>
                  <div className="mt-2 text-xs text-slate-600">
                    {r.reports.map((rep) => (
                      <div key={rep.title + rep.date}>{rep.title} | {rep.source} | {new Date(rep.date).toLocaleDateString()}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PatientPanelPage;
