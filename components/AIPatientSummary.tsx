import React, { useState, useEffect } from 'react';
import { Patient, PatientSummary } from '../types';
import { Sparkles, Loader2, FileText, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { generatePatientSummary } from '../services/geminiService';

interface AIPatientSummaryProps {
  patient: Patient;
  autoGenerate?: boolean;
}

const AIPatientSummary: React.FC<AIPatientSummaryProps> = ({ patient, autoGenerate = true }) => {
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoGenerate) {
      handleGenerateSummary();
    }
  }, [patient.id, patient.lastUpdated]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generatePatientSummary(patient);
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error('Summary generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm border-2 border-purple-200 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          <h3 className="text-base font-bold text-gray-900">AI-Assisted Patient Overview</h3>
          <span className="ml-2 px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-bold rounded">
            READ ONLY
          </span>
        </div>
        {!isGenerating && summary && (
          <button
            onClick={handleGenerateSummary}
            className="text-purple-600 hover:text-purple-700 transition-colors"
            title="Refresh summary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mb-2 p-2 bg-purple-100 border border-purple-300 rounded-lg">
        <p className="text-xs text-purple-900 font-semibold">
          ⚠️ AI-GENERATED: This summary is descriptive only and does not provide diagnosis or treatment decisions.
        </p>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      {isGenerating ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
            <span className="text-sm text-gray-600">Generating AI overview...</span>
          </div>
        </div>
      ) : summary ? (
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Overview */}
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-start">
              <FileText className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Overview</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{summary.overview}</p>
              </div>
            </div>
          </div>

          {/* Key Points */}
          {summary.keyPoints.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Key Points</h4>
                  <ul className="space-y-0.5">
                    {summary.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start">
                        <span className="mr-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recent Changes */}
          {summary.recentChanges.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <TrendingUp className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Recent Changes</h4>
                  <ul className="space-y-0.5">
                    {summary.recentChanges.map((change, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start">
                        <span className="mr-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-start">
                <Sparkles className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Care Considerations</h4>
                  <ul className="space-y-0.5">
                    {summary.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start">
                        <span className="mr-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 italic text-center pt-1 border-t border-purple-200">
            Auto-generated at {new Date().toLocaleString()} • AI-assisted, not a medical diagnosis
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-xs">AI overview will generate automatically</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPatientSummary;
