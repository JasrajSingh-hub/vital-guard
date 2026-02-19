// API Service - Connects frontend to backend
const API_BASE_URL = 'http://localhost:5000/api';

// ==================== PATIENTS ====================

export async function fetchPatients() {
  const response = await fetch(`${API_BASE_URL}/patients`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchDischargedPatients() {
  const response = await fetch(`${API_BASE_URL}/patients/discharged`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchPatient(id: string) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function createPatient(patientData: any) {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function updatePatient(id: string, patientData: any) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// ==================== VITALS ====================

export async function addVitals(patientId: string, vitals: any) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vitals)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

// ==================== MEDICATIONS ====================

export async function addMedication(patientId: string, medication: any) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medication)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function deleteMedication(medicationId: string) {
  const response = await fetch(`${API_BASE_URL}/medications/${medicationId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

// ==================== DOCTOR INSTRUCTIONS ====================

export async function addInstruction(patientId: string, instruction: any) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/instructions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(instruction)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function deleteInstruction(instructionId: string) {
  const response = await fetch(`${API_BASE_URL}/instructions/${instructionId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

// ==================== NURSE TASKS ====================

export async function addTask(patientId: string, task: any) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function completeTask(taskId: string, completedBy: string) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed_by: completedBy })
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// ==================== MESSAGES ====================

export async function addMessage(patientId: string, message: any) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// ==================== REPORTS ====================

export async function addReport(patientId: string, report: any) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function deleteReport(reportId: string) {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

// ==================== AI SUMMARY ====================

export async function generateSummary(patientId: string) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/summary`, {
    method: 'POST'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// ==================== DISCHARGE ====================

export async function dischargePatient(patientId: string) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/discharge`, {
    method: 'POST'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getDischargeReport(patientId: string) {
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/discharge-report`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}
