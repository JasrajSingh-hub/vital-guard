import React, { useState } from 'react';
import { Patient, PatientType, PatientContext, ReportImage } from '../types';
import { X, Upload, FileText } from 'lucide-react';
import { extractReportData } from '../services/geminiService';

interface AddPatientFormProps {
  onSubmit: (patient: Omit<Patient, 'id' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSubmit, onCancel }) => {
  const [patientType, setPatientType] = useState<PatientType>('CONTEXT_ONLY');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [condition, setCondition] = useState('');
  const [room, setRoom] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedReports, setUploadedReports] = useState<ReportImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;
        
        // Extract data using AI
        const extractedData = await extractReportData(imageUrl);
        
        const newReport: ReportImage = {
          id: Date.now().toString(),
          url: imageUrl,
          uploadedAt: new Date().toISOString(),
          extractedData: extractedData.rawText,
          type: 'PRESCRIPTION'
        };

        setUploadedReports(prev => [...prev, newReport]);
        setIsUploading(false);
        
        alert(`✅ Document uploaded!\nInformation stored for AI summary. Add medications manually after creating patient.`);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsUploading(false);
      alert('❌ Error uploading document.');
    }
  };

  const handleRemoveDocument = (reportId: string) => {
    setUploadedReports(prev => prev.filter(r => r.id !== reportId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't extract medications automatically - just store reports for AI summary
    const context: PatientContext = {
      diagnosis,
      medications: [], // Empty - user will add manually
      doctorInstructions: [],
      reports: uploadedReports,
      notes
    };

    const newPatient: Omit<Patient, 'id' | 'lastUpdated'> = {
      name,
      age: parseInt(age),
      gender,
      condition,
      room,
      patientType,
      history: [],
      riskLevel: 'STABLE',
      context: patientType === 'CONTEXT_ONLY' ? context : undefined
    };

    onSubmit(newPatient);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Patient</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPatientType('CONTEXT_ONLY')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  patientType === 'CONTEXT_ONLY' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Context Only</div>
                <div className="text-sm text-gray-600 mt-1">
                  Stable patient with care instructions
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPatientType('MONITORED')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  patientType === 'MONITORED' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Monitored</div>
                <div className="text-sm text-gray-600 mt-1">
                  Continuous vital monitoring
                </div>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
            <input
              type="text"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g., Post-operative recovery, Diabetes management"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {patientType === 'CONTEXT_ONLY' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={3}
                  placeholder="Enter diagnosis details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes, allergies, special considerations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Document Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents (Optional)</label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-blue-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="patient-document-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="patient-document-upload"
                    className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
                  >
                    <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-sm text-gray-700">
                      {isUploading ? 'Uploading...' : 'Click to upload prescription or report'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Information will be stored for AI summary</p>
                  </label>
                </div>

                {/* Uploaded Documents List */}
                {uploadedReports.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedReports.map(report => (
                      <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700">
                            Document uploaded - {new Date(report.uploadedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(report.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;
