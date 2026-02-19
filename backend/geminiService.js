import { GoogleGenAI, Type } from '@google/genai';

let ai;

function initializeAI() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
  return apiKey;
}

export function getApiKey() {
  return process.env.GEMINI_API_KEY || '';
}

export async function generatePatientSummary(patientData) {
  const apiKey = initializeAI();
  
  if (!apiKey) {
    console.warn('No API Key found. Returning mock summary.');
    return {
      overview: `${patientData.name} is a ${patientData.age}-year-old ${patientData.gender.toLowerCase()} with ${patientData.condition}.`,
      keyPoints: [
        `Patient status: ${patientData.status}`,
        `Care mode: ${patientData.care_mode}`,
        `${patientData.medications?.length || 0} active medications`
      ],
      recentChanges: ['Mock data - configure API key for real analysis'],
      recommendations: ['Configure Gemini API key for AI-powered insights']
    };
  }

  // Build comprehensive context
  let contextData = `
Patient Information:
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Condition: ${patientData.condition}
- Room: ${patientData.room}
- Care Mode: ${patientData.care_mode === 'live_monitoring' ? 'Continuous Monitoring' : 'Task-Based Care'}
- Current Status: ${patientData.status}
- Admission Time: ${patientData.admission_time}
`;

  if (patientData.diagnosis) {
    contextData += `\nDiagnosis: ${patientData.diagnosis}`;
  }

  if (patientData.vitals && patientData.vitals.length > 0) {
    const latest = patientData.vitals[patientData.vitals.length - 1];
    contextData += `\n\nLatest Vitals (${latest.timestamp}):
- Heart Rate: ${latest.heart_rate} bpm
- Blood Pressure: ${latest.systolic_bp}/${latest.diastolic_bp} mmHg
- SpO2: ${latest.spo2}%
- Respiratory Rate: ${latest.respiratory_rate} /min
- Temperature: ${latest.temperature}°C`;
  }

  if (patientData.medications && patientData.medications.length > 0) {
    contextData += `\n\nActive Medications (${patientData.medications.length}):`;
    patientData.medications.forEach(med => {
      contextData += `\n- ${med.name}: ${med.dosage}, ${med.frequency}, ${med.route}${med.timing ? ` (${med.timing})` : ''}`;
    });
  }

  if (patientData.instructions && patientData.instructions.length > 0) {
    contextData += `\n\nDoctor Instructions (${patientData.instructions.length}):`;
    patientData.instructions.forEach(inst => {
      contextData += `\n- [${inst.priority.toUpperCase()}] ${inst.instruction_text}${inst.due_time ? ` (Due: ${inst.due_time})` : ''}`;
    });
  }

  if (patientData.tasks && patientData.tasks.length > 0) {
    const pending = patientData.tasks.filter(t => t.status === 'pending');
    const completed = patientData.tasks.filter(t => t.status === 'completed');
    contextData += `\n\nNurse Tasks: ${pending.length} pending, ${completed.length} completed`;
  }

  if (patientData.reports && patientData.reports.length > 0) {
    contextData += `\n\nUploaded Reports (${patientData.reports.length}):`;
    patientData.reports.forEach(report => {
      contextData += `\n- ${report.file_name} (${report.report_type})`;
      if (report.findings) {
        contextData += `\n  Findings: ${report.findings.substring(0, 200)}`;
      }
    });
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
- This is AI-ASSISTED information for reference only
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
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
    if (!text) throw new Error('No response from AI');
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Summary generation failed:', error);
    return {
      overview: `Unable to generate AI summary. ${patientData.name} is currently ${patientData.status} with ${patientData.condition}.`,
      keyPoints: [
        `Care mode: ${patientData.care_mode}`,
        `Current status: ${patientData.status}`
      ],
      recentChanges: [],
      recommendations: ['AI service temporarily unavailable']
    };
  }
}

export async function generateDischargeSummary(patientData) {
  const apiKey = initializeAI();
  
  if (!apiKey) {
    return {
      summary: `Discharge summary for ${patientData.name}. Patient was admitted on ${patientData.admission_time} and discharged on ${patientData.discharge_time}.`,
      clinicalCourse: 'API key required for detailed discharge summary',
      finalDiagnosis: patientData.diagnosis || 'Not specified',
      medicationsAtDischarge: patientData.medications?.map(m => m.name).join(', ') || 'None',
      followUpRecommendations: ['Configure API key for AI-generated recommendations']
    };
  }

  // Calculate length of stay
  const admission = new Date(patientData.admission_time);
  const discharge = new Date(patientData.discharge_time);
  const lengthOfStay = Math.ceil((discharge - admission) / (1000 * 60 * 60 * 24));

  let contextData = `
PATIENT DISCHARGE SUMMARY

Patient Information:
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Room: ${patientData.room}
- Admission Date: ${patientData.admission_time}
- Discharge Date: ${patientData.discharge_time}
- Length of Stay: ${lengthOfStay} days
- Care Mode: ${patientData.care_mode}
- Final Status: ${patientData.status}

Diagnosis: ${patientData.diagnosis || 'Not specified'}
Condition: ${patientData.condition}
`;

  if (patientData.vitals && patientData.vitals.length > 0) {
    const first = patientData.vitals[0];
    const last = patientData.vitals[patientData.vitals.length - 1];
    contextData += `\n\nVitals Summary:
- Total readings: ${patientData.vitals.length}
- First reading: HR ${first.heart_rate}, BP ${first.systolic_bp}/${first.diastolic_bp}, SpO2 ${first.spo2}%
- Last reading: HR ${last.heart_rate}, BP ${last.systolic_bp}/${last.diastolic_bp}, SpO2 ${last.spo2}%`;
  }

  if (patientData.medications && patientData.medications.length > 0) {
    contextData += `\n\nMedications Administered (${patientData.medications.length}):`;
    patientData.medications.forEach(med => {
      contextData += `\n- ${med.name}: ${med.dosage}, ${med.frequency}, ${med.route}`;
    });
  }

  if (patientData.instructions && patientData.instructions.length > 0) {
    contextData += `\n\nDoctor Instructions (${patientData.instructions.length}):`;
    patientData.instructions.forEach(inst => {
      contextData += `\n- ${inst.instruction_text} [${inst.completed ? 'Completed' : 'Pending'}]`;
    });
  }

  if (patientData.tasks && patientData.tasks.length > 0) {
    const completed = patientData.tasks.filter(t => t.status === 'completed');
    contextData += `\n\nNurse Tasks: ${completed.length}/${patientData.tasks.length} completed`;
  }

  const prompt = `
Generate a comprehensive discharge summary for this patient.

${contextData}

Provide a structured discharge summary with:
1. A clinical course summary (2-3 paragraphs describing the patient's hospital stay)
2. Final diagnosis and condition at discharge
3. Medications at discharge (list with instructions)
4. Follow-up recommendations (care instructions, appointments, precautions)

IMPORTANT:
- Be descriptive and factual based on available data
- Do NOT make new medical recommendations
- Focus on summarizing the care provided
- Include relevant clinical observations
- This is for record-keeping and care coordination
- Label as AI-ASSISTED DISCHARGE SUMMARY
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            clinicalCourse: { type: Type.STRING },
            finalDiagnosis: { type: Type.STRING },
            medicationsAtDischarge: { type: Type.STRING },
            followUpRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['summary', 'clinicalCourse', 'finalDiagnosis', 'medicationsAtDischarge', 'followUpRecommendations']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('No response from AI');
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Discharge summary generation failed:', error);
    return {
      summary: `Discharge summary for ${patientData.name}. Patient was admitted on ${patientData.admission_time} and discharged on ${patientData.discharge_time}.`,
      clinicalCourse: 'AI service temporarily unavailable',
      finalDiagnosis: patientData.diagnosis || 'Not specified',
      medicationsAtDischarge: patientData.medications?.map(m => `${m.name} ${m.dosage}`).join(', ') || 'None',
      followUpRecommendations: ['Follow up with primary care physician']
    };
  }
}

export async function analyzeVitals(patientData, latestVitals) {
  const apiKey = initializeAI();
  
  if (!apiKey) {
    return {
      riskLevel: 'attention',
      analysis: 'API Key missing. This is a simulated AI response.',
      recommendation: 'Configure API key for real-time analysis.'
    };
  }

  const prompt = `
Analyze the following patient vitals and provide a risk assessment.

Patient Context:
Age: ${patientData.age}
Gender: ${patientData.gender}
Condition: ${patientData.condition}

Current Vitals:
Heart Rate: ${latestVitals.heart_rate} bpm
Blood Pressure: ${latestVitals.systolic_bp}/${latestVitals.diastolic_bp} mmHg
SpO2: ${latestVitals.spo2}%
Respiratory Rate: ${latestVitals.respiratory_rate} /min
Temperature: ${latestVitals.temperature}°C

Determine if the patient is stable, attention (needs observation), or critical (immediate action).
Provide a short clinical analysis and a recommendation for the nurse.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              enum: ['critical', 'attention', 'stable']
            },
            analysis: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ['riskLevel', 'analysis', 'recommendation']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('No response from AI');
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Vitals analysis failed:', error);
    return {
      riskLevel: 'attention',
      analysis: 'AI service unavailable. Please assess manually.',
      recommendation: 'Check vitals manually.'
    };
  }
}
