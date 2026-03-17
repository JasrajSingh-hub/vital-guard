import React, { useMemo } from 'react';
import { Patient, ReferralRecord, User } from '../types';
import { ActivitySquare, FileHeart, ShieldCheck } from 'lucide-react';
import { fetchPatient } from '../services/apiService';

interface PatientPanelPageProps {
  currentUser: User;
  patients: Patient[];
  referralRecords: ReferralRecord[];
  onOpenPatient: (id: string) => void;
}

const PatientPanelPage: React.FC<PatientPanelPageProps> = ({ currentUser, patients, referralRecords, onOpenPatient }) => {
  const patient = useMemo(() => patients[0] || null, [patients]);

  const buildSummaryHtml = (full: any, fallbackPatient: Patient) => {
    const esc = (value: unknown) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const now = new Date().toLocaleString();
    const meds = full.medications || [];
    const instructions = full.instructions || [];
    const reports = full.reports || [];
    const uid = full.patient_uid || fallbackPatient.patientUid || fallbackPatient.id;

    const medRows = meds.length
      ? meds
          .map(
            (m: any) =>
              `<tr><td>${esc(m.name || '-')}</td><td>${esc(m.dosage || '-')}</td><td>${esc(m.frequency || '-')}</td><td>${esc(m.route || '-')}${m.timing ? ` (${esc(m.timing)})` : ''}</td></tr>`
          )
          .join('')
      : '<tr><td colspan="4">No medications</td></tr>';

    const instructionRows = instructions.length
      ? instructions
          .map(
            (i: any) =>
              `<tr><td>[${esc(String(i.priority || '').toUpperCase())}] ${esc(i.instruction_text || '-')}</td><td>${esc(i.created_by || '-')}</td><td>${esc(i.due_time || '-')}</td></tr>`
          )
          .join('')
      : '<tr><td colspan="3">No instructions</td></tr>';

    const reportBlocks = reports.length
      ? reports
          .map((r: any) => {
            const preview = r.image_data_url
              ? `<img src="${r.image_data_url}" alt="${esc(r.file_name || 'report')}" style="max-width:100%;max-height:420px;border:1px solid #cbd5e1;border-radius:8px;" />`
              : '<div style="padding:12px;border:1px dashed #94a3b8;border-radius:8px;color:#475569;">No image preview stored for this report.</div>';
            const extracted = r.extracted_text
              ? `<pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;">${esc(String(r.extracted_text))}</pre>`
              : '<p style="color:#475569;">No extracted text.</p>';
            return `
              <article style="margin-bottom:16px;padding:12px;border:1px solid #e2e8f0;border-radius:10px;">
                <h4 style="margin:0 0 6px 0;">${esc(r.file_name || 'Uploaded report')} (${esc(r.report_type || 'OTHER')})</h4>
                <p style="margin:0 0 10px 0;color:#475569;">Uploaded: ${esc(r.uploaded_at ? new Date(r.uploaded_at).toLocaleString() : '-')}</p>
                ${preview}
                <h5 style="margin:10px 0 6px 0;">Extracted Data</h5>
                ${extracted}
              </article>
            `;
          })
          .join('')
      : '<p>No uploaded documents.</p>';

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Patient Summary - ${esc(uid)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
    h1,h2,h3 { margin: 0 0 8px 0; }
    .muted { color: #475569; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #f1f5f9; }
    .section { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>VitalGuard Patient Summary</h1>
  <p class="muted">Generated: ${now}</p>
  <div class="section">
    <h3>Patient Details</h3>
    <p><strong>UID:</strong> ${esc(uid)}</p>
    <p><strong>Name:</strong> ${esc(full.name || fallbackPatient.name)}</p>
    <p><strong>Age/Gender:</strong> ${esc(full.age || fallbackPatient.age)} / ${esc(full.gender || fallbackPatient.gender)}</p>
    <p><strong>Condition:</strong> ${esc(full.condition || fallbackPatient.condition)}</p>
    <p><strong>Room:</strong> ${esc(full.room || fallbackPatient.room)}</p>
    <p><strong>Status:</strong> ${esc(String(full.status || fallbackPatient.riskLevel || '-').toUpperCase())}</p>
  </div>
  <div class="section">
    <h3>Medications</h3>
    <table>
      <thead><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Route/Timing</th></tr></thead>
      <tbody>${medRows}</tbody>
    </table>
  </div>
  <div class="section">
    <h3>Doctor Instructions</h3>
    <table>
      <thead><tr><th>Instruction</th><th>Created By</th><th>Due</th></tr></thead>
      <tbody>${instructionRows}</tbody>
    </table>
  </div>
  <div class="section">
    <h3>Uploaded Documents</h3>
    ${reportBlocks}
  </div>
</body>
</html>`;
  };

  const downloadSummaryTxt = async () => {
    if (!patient) return;
    try {
      const full = await fetchPatient(patient.id);
      const meds = (full.medications || [])
        .map((m: any) => `- ${m.name} | ${m.dosage} | ${m.frequency} | ${m.route}${m.timing ? ` | ${m.timing}` : ''}`)
        .join('\n');
      const instructions = (full.instructions || [])
        .map((i: any) => `- [${String(i.priority || '').toUpperCase()}] ${i.instruction_text} | by ${i.created_by}${i.due_time ? ` | due ${i.due_time}` : ''}`)
        .join('\n');
      const reports = (full.reports || [])
        .map((r: any) => `- ${r.file_name} (${r.report_type}) | ${r.uploaded_at}`)
        .join('\n');

      const text = [
        'VitalGuard Patient Summary',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        `Patient UID: ${full.patient_uid || patient.patientUid || patient.id}`,
        `Name: ${full.name}`,
        `Age/Gender: ${full.age} / ${full.gender}`,
        `Condition: ${full.condition}`,
        `Room: ${full.room}`,
        `Status: ${full.status}`,
        '',
        'Medications Given:',
        meds || '- None',
        '',
        'Doctor Instructions:',
        instructions || '- None',
        '',
        'Uploaded Documents:',
        reports || '- None'
      ].join('\n');

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${full.patient_uid || patient.patientUid || patient.id}-summary.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download summary:', error);
      alert('Unable to generate summary right now.');
    }
  };

  const exportSummaryPdf = async () => {
    if (!patient) return;
    try {
      const full = await fetchPatient(patient.id);
      const html = buildSummaryHtml(full, patient);
      const win = window.open('', '_blank');
      if (!win) {
        alert('Popup blocked. Allow popups to export PDF.');
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 300);
    } catch (error) {
      console.error('Failed to export summary PDF:', error);
      alert('Unable to export PDF summary right now.');
    }
  };

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
              <p className="font-semibold text-slate-900">Download Summary</p>
              <p className="text-sm text-slate-600 mt-1">TXT or print-ready PDF including uploaded docs.</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={downloadSummaryTxt}
                  className="px-3 py-2 text-sm rounded-md bg-slate-700 text-white hover:bg-slate-800"
                >
                  Download TXT
                </button>
                <button
                  onClick={exportSummaryPdf}
                  className="px-3 py-2 text-sm rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  Export PDF
                </button>
              </div>
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
