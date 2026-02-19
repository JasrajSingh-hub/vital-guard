import React, { useMemo, useState } from 'react';
import { AuditEntry, User, UserRole } from '../types';

interface AuditTrailPageProps {
  currentUser: User;
  auditEntries: AuditEntry[];
}

const AuditTrailPage: React.FC<AuditTrailPageProps> = ({ currentUser, auditEntries }) => {
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => {
    return auditEntries.filter((entry) => {
      const byRole = roleFilter === 'ALL' || entry.actorRole === roleFilter;
      const byDate = !dateFilter || entry.timestamp.startsWith(dateFilter);
      return byRole && byDate;
    });
  }, [auditEntries, roleFilter, dateFilter]);

  if (currentUser.role !== 'ADMIN') {
    return (
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Audit Trail</h1>
        <p className="text-slate-600 mt-2">This page is available for Admin role only.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Audit Trail</h1>
        <p className="text-sm text-slate-600 mt-1">Immutable access history with blockchain references.</p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-300"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | UserRole)}
            className="px-3 py-2 rounded-md border border-slate-300"
          >
            <option value="ALL">All Roles</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="PATIENT">Patient</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200">
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Action</th>
                <th className="py-2 pr-3">Target</th>
                <th className="py-2 pr-3">Timestamp</th>
                <th className="py-2 pr-3">Verification</th>
                <th className="py-2">Blockchain Ref</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{entry.actorName} ({entry.actorRole})</td>
                  <td className="py-2 pr-3">{entry.action}</td>
                  <td className="py-2 pr-3">{entry.target}</td>
                  <td className="py-2 pr-3">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        entry.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {entry.verificationStatus}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-xs">{entry.blockchainRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-sm text-slate-500 mt-4">No audit entries for selected filters.</p>}
        </div>
      </section>
    </div>
  );
};

export default AuditTrailPage;
