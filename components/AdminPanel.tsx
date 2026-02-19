import React, { useMemo, useState } from 'react';
import { Patient, StoredUser, User } from '../types';
import { ShieldCheck, Users, BedDouble, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  patients: Patient[];
  staffUsers: StoredUser[];
  pendingUsers: StoredUser[];
  onApproveUser: (email: string, role: 'DOCTOR' | 'NURSE') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, patients, staffUsers, pendingUsers, onApproveUser }) => {
  const [patientSearch, setPatientSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const metrics = useMemo(() => {
    return {
      total: patients.length,
      critical: patients.filter((p) => p.riskLevel === 'CRITICAL').length,
      monitored: patients.filter((p) => p.patientType === 'MONITORED').length,
      taskBased: patients.filter((p) => p.patientType === 'CONTEXT_ONLY').length
    };
  }, [patients]);
  const filteredPatients = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          (p.patientUid || '').toLowerCase().includes(patientSearch.toLowerCase())
      ),
    [patients, patientSearch]
  );
  const filteredStaff = useMemo(
    () =>
      staffUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
          u.uid.toLowerCase().includes(staffSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(staffSearch.toLowerCase())
      ),
    [staffUsers, staffSearch]
  );

  return (
    <section className="space-y-6">
      <header className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-sm text-slate-600">Welcome, {currentUser.name}</p>
        <h1 className="text-2xl font-semibold text-slate-900 mt-1">Admin Control Panel</h1>
        <p className="text-sm text-slate-600 mt-2">
          Operational view for access governance, patient load, and risk monitoring.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Patients</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{metrics.total}</p>
        </article>
        <article className="bg-white border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600">Critical Cases</p>
          <p className="text-2xl font-semibold text-red-700 mt-1">{metrics.critical}</p>
        </article>
        <article className="bg-white border border-sky-200 rounded-xl p-4">
          <p className="text-xs text-sky-700">Live Monitoring</p>
          <p className="text-2xl font-semibold text-sky-800 mt-1">{metrics.monitored}</p>
        </article>
        <article className="bg-white border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-700">Task-Based Care</p>
          <p className="text-2xl font-semibold text-emerald-800 mt-1">{metrics.taskBased}</p>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-slate-700" />
            Access Matrix
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p><strong>Doctor:</strong> View all patients, review summaries, coordinate with team.</p>
            <p><strong>Nurse:</strong> Add patients, record vitals, complete care tasks.</p>
            <p><strong>Patient:</strong> View own care information and contact care team.</p>
            <p><strong>Admin:</strong> Oversight dashboard and role-level communication.</p>
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-slate-700" />
            Operations Notes
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc list-inside">
            <li>Review high-priority cases first each shift.</li>
            <li>Keep role accounts restricted to clinical need.</li>
            <li>Track unresolved instructions for nursing handoff.</li>
          </ul>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-slate-900 flex items-center">
            <BedDouble className="w-4 h-4 mr-2 text-slate-700" />
            Bed Occupancy
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            {metrics.total} patients currently active across monitored and task-based care units.
          </p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-slate-900 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-red-700" />
            Risk Watch
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            {metrics.critical === 0
              ? 'No critical patients right now.'
              : `${metrics.critical} critical patient(s) need immediate attention.`}
          </p>
        </article>
      </div>

      <article className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-900">Pending Staff Approvals</h2>
        <p className="text-sm text-slate-600 mt-1">
          Doctor and Nurse accounts require admin approval before login.
        </p>
        <div className="mt-4 space-y-3">
          {pendingUsers.length === 0 && (
            <p className="text-sm text-slate-500">No pending requests.</p>
          )}
          {pendingUsers.map((u) => (
            <div key={`${u.email}-${u.role}`} className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50">
              <div>
                <p className="font-semibold text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-600">{u.email} | {u.role}</p>
              </div>
              <button
                onClick={() => onApproveUser(u.email, u.role as 'DOCTOR' | 'NURSE')}
                className="px-3 py-1.5 text-sm bg-emerald-700 text-white rounded hover:bg-emerald-800"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      </article>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900">Find Patient By UID</h2>
          <input
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="Search by patient UID or name"
            className="mt-3 w-full px-3 py-2 border border-slate-300 rounded-md"
          />
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
            {filteredPatients.map((p) => (
              <div key={p.id} className="p-2 rounded border border-slate-200 bg-slate-50 text-sm">
                <p className="font-semibold text-slate-900">{p.name} ({p.patientUid || p.id})</p>
                <p className="text-slate-600">Status: {p.riskLevel}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-900">Find Staff By UID</h2>
          <input
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
            placeholder="Search by UID, name, or gmail"
            className="mt-3 w-full px-3 py-2 border border-slate-300 rounded-md"
          />
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
            {filteredStaff.map((u) => (
              <div key={u.uid} className="p-2 rounded border border-slate-200 bg-slate-50 text-sm">
                <p className="font-semibold text-slate-900">{u.name} ({u.uid})</p>
                <p className="text-slate-600">{u.role} | {u.approvalStatus} | {u.statusMessage}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};

export default AdminPanel;
