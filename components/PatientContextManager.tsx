import React, { useState } from 'react';
import { Patient, ReportImage, Medication, DoctorInstruction } from '../types';
import { Upload, FileText, Eye, X, Plus, Pill, ClipboardList } from 'lucide-react';
import { extractReportData } from '../services/geminiService';

interface PatientContextManagerProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

const PatientContextManager: React.FC<PatientContextManagerProps> = ({ patient, onUpdatePatient }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<ReportImage | null>(null);
  
  // Medication form state
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medRoute, setMedRoute] = useState('oral');
  const [medTiming, setMedTiming] = useState('');
  
  // Doctor instruction form state
  const [showInstructionForm, setShowInstructionForm] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [dueTime, setDueTime] = useState('');

  const context = patient.context || {
    diagnosis: '',
    medications: [],
    doctorInstructions: [],
    reports: [],
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);

    try {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;
        
        // Extract data using AI (for information only, not auto-adding)
        const extractedData = await extractReportData(imageUrl);
        
        const newReport: ReportImage = {
          id: Date.now().toString(),
          url: imageUrl,
          uploadedAt: new Date().toISOString(),
          extractedData: extractedData.rawText,
          type: 'OTHER', // Default, can be changed by user
          findings: extractedData.rawText
        };

        const updatedContext = {
          ...context,
          reports: [...context.reports, newReport]
        };

        onUpdatePatient({ ...patient, context: updatedContext });
        setIsExtracting(false);
        
        // Show success message - info is stored for AI summary, not auto-added
        alert(`✅ Document uploaded successfully!\n\nExtracted information has been stored and will be used by AI when generating patient summaries.\n\nYou can manually add medications or instructions using the forms below.`);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsExtracting(false);
      alert('❌ Error uploading document. Please try again.');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const updatedContext = {
        ...context,
        reports: context.reports.filter((r: ReportImage) => r.id !== reportId)
      };
      onUpdatePatient({ ...patient, context: updatedContext });
    }
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medName,
      dosage: medDosage,
      frequency: medFrequency,
      route: medRoute,
      timing: medTiming || undefined
    };

    const updatedContext = {
      ...context,
      medications: [...context.medications, newMedication]
    };

    onUpdatePatient({ ...patient, context: updatedContext });
    
    // Reset form
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
    setMedRoute('oral');
    setMedTiming('');
    setShowMedicationForm(false);
  };

  const handleDeleteMedication = (medId: string) => {
    if (confirm('Remove this medication?')) {
      const updatedContext = {
        ...context,
        medications: context.medications.filter((m: Medication) => m.id !== medId)
      };
      onUpdatePatient({ ...patient, context: updatedContext });
    }
  };

  const handleAddInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInstruction: DoctorInstruction = {
      id: Date.now().toString(),
      instruction: instruction,
      priority: priority,
      dueTime: dueTime || undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'Doctor'
    };

    const updatedContext = {
      ...context,
      doctorInstructions: [...context.doctorInstructions, newInstruction]
    };

    onUpdatePatient({ ...patient, context: updatedContext });
    
    // Reset form
    setInstruction('');
    setPriority('MEDIUM');
    setDueTime('');
    setShowInstructionForm(false);
  };

  const handleDeleteInstruction = (instId: string) => {
    if (confirm('Remove this instruction?')) {
      const updatedContext = {
        ...context,
        doctorInstructions: context.doctorInstructions.filter((i: DoctorInstruction) => i.id !== instId)
      };
      onUpdatePatient({ ...patient, context: updatedContext });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Report Section */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-blue-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-blue-500" />
          Upload Report / Test Results
        </h3>
        
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="report-upload"
            disabled={isExtracting}
          />
          <label
            htmlFor="report-upload"
            className={`cursor-pointer ${isExtracting ? 'opacity-50' : ''}`}
          >
            <Upload className="w-12 h-12 mx-auto text-blue-500 mb-2" />
            <p className="text-sm font-semibold text-gray-700">
              {isExtracting ? '⏳ Processing document...' : '📄 Click to upload report (Blood Test, X-Ray, ECG, Prescription, etc.)'}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              ✨ AI will extract information for reference - stored for patient summary
            </p>
            <p className="text-xs text-blue-600 mt-1 font-semibold">
              Supported: JPG, PNG, PDF images
            </p>
          </label>
        </div>

        {/* Uploaded Reports List */}
        {context.reports.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Uploaded Documents ({context.reports.length})
            </h4>
            <div className="space-y-2">
              {context.reports.map((report: ReportImage) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{report.reportName || report.type}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(report.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewingDocument(report)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Medications Section */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-green-300 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Pill className="w-5 h-5 mr-2 text-green-500" />
            Medications
          </h3>
          <button
            onClick={() => setShowMedicationForm(!showMedicationForm)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Medication
          </button>
        </div>

        {/* Add Medication Form */}
        {showMedicationForm && (
          <form onSubmit={handleAddMedication} className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Medication Name *</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="e.g., Aspirin"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dosage *</label>
                <input
                  type="text"
                  required
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="e.g., 500mg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency *</label>
                <input
                  type="text"
                  required
                  value={medFrequency}
                  onChange={(e) => setMedFrequency(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="e.g., 2x daily"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Route *</label>
                <select
                  value={medRoute}
                  onChange={(e) => setMedRoute(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="oral">Oral</option>
                  <option value="IV">IV</option>
                  <option value="injection">Injection</option>
                  <option value="topical">Topical</option>
                  <option value="inhaled">Inhaled</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Timing (Optional)</label>
                <input
                  type="text"
                  value={medTiming}
                  onChange={(e) => setMedTiming(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="e.g., after food, 6 PM"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700">
                Add
              </button>
              <button type="button" onClick={() => setShowMedicationForm(false)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-semibold hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Medications List */}
        {context.medications.length > 0 ? (
          <div className="space-y-2">
            {context.medications.map((med: Medication) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                <div>
                  <p className="font-semibold text-gray-900">{med.name}</p>
                  <p className="text-sm text-gray-600">
                    {med.dosage} • {med.frequency} • {med.route}
                    {med.timing && ` • ${med.timing}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMedication(med.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No medications added yet</p>
        )}
      </div>

      {/* Doctor Instructions Section */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-slate-300 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-slate-600" />
            Doctor Instructions
          </h3>
          <button
            onClick={() => setShowInstructionForm(!showInstructionForm)}
            className="flex items-center px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Instruction
          </button>
        </div>

        {/* Add Instruction Form */}
        {showInstructionForm && (
          <form onSubmit={handleAddInstruction} className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instruction *</label>
                <textarea
                  required
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  rows={3}
                  placeholder="e.g., Administer injection at 6 PM, Monitor blood pressure every 2 hours"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Time (Optional)</label>
                  <input
                    type="text"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="e.g., 6:00 PM, Every 2 hours"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <button type="submit" className="px-3 py-1 bg-slate-700 text-white rounded text-sm font-semibold hover:bg-slate-800">
                Add
              </button>
              <button type="button" onClick={() => setShowInstructionForm(false)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-semibold hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Instructions List */}
        {context.doctorInstructions.length > 0 ? (
          <div className="space-y-2">
            {context.doctorInstructions.map((inst: DoctorInstruction) => (
              <div key={inst.id} className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      inst.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      inst.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {inst.priority}
                    </span>
                    {inst.dueTime && (
                      <span className="text-xs text-gray-600">Due: {inst.dueTime}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900">{inst.instruction}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Added by {inst.createdBy} • {new Date(inst.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteInstruction(inst.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold ml-3"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No instructions added yet</p>
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                <div>
                  <h3 className="text-lg font-bold">Document Viewer</h3>
                  <p className="text-sm text-blue-100">
                    {viewingDocument.type} - {new Date(viewingDocument.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <img
                  src={viewingDocument.url}
                  alt="Document"
                  className="w-full rounded-lg border-2 border-gray-300 shadow-lg"
                />
              </div>

              {viewingDocument.extractedData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Extracted Information:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {viewingDocument.extractedData}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setViewingDocument(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientContextManager;
