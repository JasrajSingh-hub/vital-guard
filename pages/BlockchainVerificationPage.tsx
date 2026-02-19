import React, { useMemo, useState } from 'react';
import { BlockchainRecordProof, Patient, User } from '../types';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { createTransactionId, simpleHash } from '../services/blockchainDemoService';

interface BlockchainVerificationPageProps {
  currentUser: User;
  patients: Patient[];
  onVerificationLogged: (proof: BlockchainRecordProof) => void;
}

const BlockchainVerificationPage: React.FC<BlockchainVerificationPageProps> = ({
  currentUser,
  patients,
  onVerificationLogged
}) => {
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [simulateTamper, setSimulateTamper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlockchainRecordProof | null>(null);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'DOCTOR') {
    return (
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Blockchain Verification</h1>
        <p className="text-slate-600 mt-2">This page is available for Admin and Doctor roles.</p>
      </section>
    );
  }

  const verify = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    setResult(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const payload = `${selectedPatient.id}-${selectedPatient.lastUpdated}-${selectedPatient.riskLevel}`;
    const recordHash = simpleHash(payload);
    const blockchainHash = simulateTamper ? simpleHash(`${payload}-tampered`) : recordHash;
    const status = recordHash === blockchainHash ? 'VERIFIED' : 'TAMPERED';
    const proof: BlockchainRecordProof = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      recordHash,
      blockchainHash,
      status,
      transactionId: createTransactionId(selectedPatient.id),
      network: 'Ethereum Sepolia (Demo)',
      timestamp: new Date().toISOString()
    };
    setResult(proof);
    onVerificationLogged(proof);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Blockchain Verification</h1>
        <p className="text-sm text-slate-600 mt-1">
          Fetch record, generate hash, compare on-chain hash, and display integrity result.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="px-3 py-2 rounded-md border border-slate-300"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.room})
              </option>
            ))}
          </select>
          <label className="flex items-center text-sm text-slate-700">
            <input
              type="checkbox"
              checked={simulateTamper}
              onChange={(e) => setSimulateTamper(e.target.checked)}
              className="mr-2"
            />
            Simulate tampered chain hash
          </label>
          <button
            onClick={verify}
            disabled={loading || !selectedPatient}
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Record'}
          </button>
        </div>

        {loading && (
          <div className="flex items-center text-sm text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Comparing generated hash against blockchain proof...
          </div>
        )}
      </section>

      {result && (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Verification Result</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${
                result.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {result.status === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
              {result.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Generated Record Hash</p>
              <p className="font-mono text-slate-900 break-all">{result.recordHash}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Blockchain Hash</p>
              <p className="font-mono text-slate-900 break-all">{result.blockchainHash}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Transaction ID: {result.transactionId} | Network: {result.network}
          </p>
        </section>
      )}
    </div>
  );
};

export default BlockchainVerificationPage;
