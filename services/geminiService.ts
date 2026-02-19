import { GoogleGenAI, Type } from "@google/genai";
import { Patient, AIAnalysisResult, Vitals, ReportExtractionResult, Medication, PatientSummary, ReportImage, DoctorInstruction, NurseTask } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize specific model
const ai = new GoogleGenAI({ apiKey });

export const analyzePatientVitals = async (
  patient: Patient,
  latestVitals: Vitals
): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    // Fallback if no API key is present for demo purposes
    console.warn("No API Key found. Returning mock analysis.");
    return {
      riskLevel: 'ATTENTION',
      analysis: 'API Key missing. This is a simulated AI response based on heuristics.',
      recommendation: 'Please configure the Google Gemini API Key to enable real-time AI analysis.'
    };
  }

  const prompt = `
    Analyze the following patient vitals and provide a risk assessment.
    
    Patient Context:
    Age: ${patient.age}
    Gender: ${patient.gender}
    Condition: ${patient.condition}
    
    Current Vitals:
    Heart Rate: ${latestVitals.heartRate} bpm
    Blood Pressure: ${latestVitals.systolicBp}/${latestVitals.diastolicBp} mmHg
    SpO2: ${latestVitals.spO2}%
    Respiratory Rate: ${latestVitals.respRate} /min
    Temperature: ${latestVitals.temperature} C
    
    Determine if the patient is STABLE, ATTENTION (needs observation), or CRITICAL (immediate action).
    Provide a short clinical analysis and a recommendation for the nurse.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              enum: ['CRITICAL', 'ATTENTION', 'STABLE']
            },
            analysis: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ['riskLevel', 'analysis', 'recommendation']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return {
      riskLevel: 'ATTENTION', // Default to caution on error
      analysis: 'AI service unavailable. Please assess manually.',
      recommendation: 'Check vitals manually.'
    };
  }
};


export const extractReportData = async (imageDataUrl: string): Promise<ReportExtractionResult> => {
  if (!apiKey) {
    console.warn("No API Key found. Returning mock extraction.");
    return {
      medications: [],
      diagnosis: 'Sample diagnosis (API key required for real extraction)',
      instructions: ['Sample instruction'],
      rawText: 'Mock extraction - configure API key for real data'
    };
  }

  try {
    // Extract base64 data from data URL
    const base64Data = imageDataUrl.split(',')[1];
    
    const prompt = `
      Analyze this medical document (could be prescription, blood test, X-ray, ECG, or any medical report) and extract the following information:
      
      IMPORTANT: Only extract information that is VISIBLE in the document. Do NOT suggest or recommend anything.
      
      1. If this is a prescription or medication list: Extract medication names, dosages, frequencies, and routes
      2. If this is a lab report (blood test, etc.): Extract test names, values, and any abnormal findings
      3. If this is an imaging report (X-ray, ECG, scan): Extract the findings and observations
      4. Extract any diagnosis or condition mentioned
      5. Extract any doctor instructions or care notes visible in the document
      
      Provide structured data for reference only. This information will be stored and used by AI when generating patient summaries.
      Do NOT add medications or make recommendations - only extract what is visible.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  route: { type: Type.STRING }
                },
                required: ['name', 'dosage', 'frequency', 'route']
              }
            },
            diagnosis: { type: Type.STRING },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            rawText: { type: Type.STRING }
          },
          required: ['medications', 'rawText']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    
    // Add IDs to medications (for reference only, not auto-added)
    const medicationsWithIds: Medication[] = result.medications.map((med: any) => ({
      ...med,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));
    
    return {
      ...result,
      medications: medicationsWithIds
    };
  } catch (error) {
    console.error("Report extraction failed:", error);
    return {
      medications: [],
      rawText: 'Extraction failed. Information can be added manually.',
      instructions: []
    };
  }
};


export const generatePatientSummary = async (patient: Patient): Promise<PatientSummary> => {
  if (!apiKey) {
    console.warn("No API Key found. Returning mock summary.");
    return {
      overview: `${patient.name} is a ${patient.age}-year-old ${patient.gender.toLowerCase()} with ${patient.condition}. Currently in ${patient.room}. (API key required for detailed AI summary)`,
      keyPoints: [
        'Patient status: ' + patient.riskLevel,
        patient.patientType === 'MONITORED' ? 'Under continuous monitoring' : 'Care coordination mode',
        patient.context?.medications ? `${patient.context.medications.length} active medications` : 'No medications recorded'
      ],
      recentChanges: ['Mock data - configure API key for real analysis'],
      recommendations: ['Configure Gemini API key for AI-powered insights']
    };
  }

  // Build comprehensive patient data context
  const latestVitals = patient.history[patient.history.length - 1];
  const isMonitored = patient.patientType === 'MONITORED';
  
  let contextData = `
Patient Information:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Condition: ${patient.condition}
- Room: ${patient.room}
- Patient Type: ${isMonitored ? 'Continuous Monitoring' : 'Care Coordination Only'}
- Current Risk Level: ${patient.riskLevel}
`;

  if (isMonitored && latestVitals) {
    contextData += `
Recent Vitals (${new Date(latestVitals.timestamp).toLocaleString()}):
- Heart Rate: ${latestVitals.heartRate} bpm
- Blood Pressure: ${latestVitals.systolicBp}/${latestVitals.diastolicBp} mmHg
- SpO2: ${latestVitals.spO2}%
- Respiratory Rate: ${latestVitals.respRate} /min
- Temperature: ${latestVitals.temperature}°C
`;
  }

  if (patient.context) {
    if (patient.context.diagnosis) {
      contextData += `\nDiagnosis: ${patient.context.diagnosis}`;
    }

    if (patient.context.reports.length > 0) {
      contextData += `\n\nUploaded Medical Reports (${patient.context.reports.length}):`;
      patient.context.reports.forEach((report: ReportImage) => {
        contextData += `\n- ${report.reportName || report.type} (Uploaded: ${new Date(report.uploadedAt).toLocaleDateString()})`;
        if (report.findings) {
          contextData += `\n  Findings: ${report.findings}`;
        }
        if (report.extractedData) {
          contextData += `\n  Details: ${report.extractedData.substring(0, 200)}...`;
        }
      });
    }

    if (patient.context.medications.length > 0) {
      contextData += `\n\nActive Medications (${patient.context.medications.length}):`;
      patient.context.medications.forEach((med: Medication) => {
        contextData += `\n- ${med.name}: ${med.dosage}, ${med.frequency}, ${med.route}${med.timing ? ` (${med.timing})` : ''}`;
      });
    }

    if (patient.context.doctorInstructions.length > 0) {
      contextData += `\n\nDoctor Instructions (${patient.context.doctorInstructions.length}):`;
      patient.context.doctorInstructions.forEach((inst: DoctorInstruction) => {
        contextData += `\n- [${inst.priority}] ${inst.instruction}${inst.dueTime ? ` (Due: ${inst.dueTime})` : ''} - ${inst.createdBy}`;
      });
    }

    if (patient.context.completedTasks && patient.context.completedTasks.length > 0) {
      const recentCompleted = patient.context.completedTasks.slice(-3);
      contextData += `\n\nRecently Completed Tasks (${recentCompleted.length}):`;
      recentCompleted.forEach((task: NurseTask) => {
        contextData += `\n- ${task.description} (Completed: ${task.completedAt ? new Date(task.completedAt).toLocaleString() : 'N/A'})`;
      });
    }

    if (patient.context.allergies && patient.context.allergies.length > 0) {
      contextData += `\n\nAllergies: ${patient.context.allergies.join(', ')}`;
    }

    if (patient.context.notes) {
      contextData += `\n\nClinical Notes: ${patient.context.notes}`;
    }
  }

  if (patient.aiAnalysis) {
    contextData += `\n\nLatest AI Risk Analysis: ${patient.aiAnalysis}`;
  }

  const prompt = `
You are a clinical assistant helping healthcare professionals understand a patient's current status.
Generate a concise, human-readable summary of this patient's condition.

${contextData}

Provide a structured summary with:
1. A brief overview paragraph (2-3 sentences) describing the patient's current status
2. Key points to note (3-5 bullet points about important clinical information)
3. Recent changes or trends (if any vitals history or completed tasks indicate changes)
4. Care considerations (NOT prescriptive recommendations, but assistive observations about care coordination)

IMPORTANT: 
- Be descriptive and assistive, NOT diagnostic or prescriptive
- Focus on summarizing available data, not making medical decisions
- Highlight care coordination needs (medications, tasks, instructions)
- Note any concerning trends in vitals if present
- Keep language clear and professional
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recentChanges: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['overview', 'keyPoints', 'recentChanges', 'recommendations']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as PatientSummary;
  } catch (error) {
    console.error("Summary generation failed:", error);
    return {
      overview: `Unable to generate AI summary. ${patient.name} is currently ${patient.riskLevel.toLowerCase()} with ${patient.condition}.`,
      keyPoints: [
        `Patient type: ${patient.patientType === 'MONITORED' ? 'Continuous monitoring' : 'Care coordination'}`,
        `Current status: ${patient.riskLevel}`
      ],
      recentChanges: [],
      recommendations: ['AI service temporarily unavailable']
    };
  }
};
