import { Patient, Vitals, RiskLevel } from '../types';

const generateHistory = (baseRisk: RiskLevel): Vitals[] => {
  const history: Vitals[] = [];
  const now = Date.now();
  const hour = 3600000;

  for (let i = 0; i < 10; i++) {
    const time = new Date(now - (9 - i) * hour).toISOString();
    
    let hr = 75, sys = 120, dia = 80, o2 = 98, rr = 16, temp = 37.0;

    if (baseRisk === 'CRITICAL') {
      hr = 110 + Math.random() * 20;
      o2 = 88 + Math.random() * 5;
      sys = 90 + Math.random() * 10;
      rr = 24 + Math.random() * 6;
      temp = 38.5 + Math.random();
    } else if (baseRisk === 'ATTENTION') {
      hr = 90 + Math.random() * 15;
      o2 = 93 + Math.random() * 3;
      sys = 135 + Math.random() * 10;
      temp = 37.5 + Math.random();
    } else {
      hr = 60 + Math.random() * 20;
      o2 = 96 + Math.random() * 4;
      sys = 110 + Math.random() * 20;
      temp = 36.5 + Math.random();
    }

    history.push({
      timestamp: time,
      heartRate: Math.floor(hr),
      systolicBp: Math.floor(sys),
      diastolicBp: Math.floor(dia),
      spO2: Math.floor(o2),
      respRate: Math.floor(rr),
      temperature: parseFloat(temp.toFixed(1))
    });
  }
  return history;
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'John Doe',
    age: 65,
    gender: 'Male',
    condition: 'Post-op Cardiac Surgery',
    room: 'ICU-01',
    patientType: 'MONITORED',
    riskLevel: 'CRITICAL',
    history: generateHistory('CRITICAL'),
    lastUpdated: new Date().toISOString(),
    aiAnalysis: 'Patient showing signs of tachycardia and desaturation. Immediate assessment required.',
    context: {
      diagnosis: 'Post-operative cardiac surgery recovery',
      medications: [
        {
          id: 'med1',
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          route: 'oral',
          timing: 'Morning'
        },
        {
          id: 'med2',
          name: 'Metoprolol',
          dosage: '50mg',
          frequency: '2x daily',
          route: 'oral',
          timing: 'Morning and evening'
        }
      ],
      doctorInstructions: [
        {
          id: 'inst1',
          instruction: 'Monitor cardiac rhythm every 2 hours',
          priority: 'HIGH',
          dueTime: '14:00',
          createdAt: new Date().toISOString(),
          createdBy: 'Dr. Smith'
        }
      ],
      reports: [],
      allergies: [],
      notes: 'Post-op day 2. Monitor closely for arrhythmias.',
      messages: []
    }
  },
  {
    id: 'p2',
    name: 'Sarah Smith',
    age: 42,
    gender: 'Female',
    condition: 'Pneumonia',
    room: 'Ward-3B',
    patientType: 'MONITORED',
    riskLevel: 'ATTENTION',
    history: generateHistory('ATTENTION'),
    lastUpdated: new Date().toISOString(),
    aiAnalysis: 'Elevated temperature and respiratory rate. Monitor closely for sepsis signs.',
    context: {
      diagnosis: 'Community-acquired pneumonia',
      medications: [
        {
          id: 'med1',
          name: 'Azithromycin',
          dosage: '500mg',
          frequency: 'Once daily',
          route: 'IV',
          timing: '10:00 AM'
        },
        {
          id: 'med2',
          name: 'Acetaminophen',
          dosage: '650mg',
          frequency: 'Every 6 hours',
          route: 'oral',
          timing: 'As needed for fever'
        }
      ],
      doctorInstructions: [
        {
          id: 'inst1',
          instruction: 'Administer IV antibiotics at 10 AM',
          priority: 'HIGH',
          dueTime: '10:00',
          createdAt: new Date().toISOString(),
          createdBy: 'Dr. Johnson'
        },
        {
          id: 'inst2',
          instruction: 'Monitor temperature every 4 hours',
          priority: 'MEDIUM',
          createdAt: new Date().toISOString(),
          createdBy: 'Dr. Johnson'
        }
      ],
      reports: [],
      allergies: ['Penicillin'],
      notes: 'Day 3 of treatment. Showing improvement.',
      messages: []
    }
  },
  {
    id: 'p3',
    name: 'Maria Garcia',
    age: 48,
    gender: 'Female',
    condition: 'Diabetes Management',
    room: 'Ward-4A',
    patientType: 'CONTEXT_ONLY',
    riskLevel: 'STABLE',
    history: [],
    lastUpdated: new Date().toISOString(),
    context: {
      diagnosis: 'Type 2 Diabetes Mellitus with controlled blood sugar levels',
      medications: [
        {
          id: 'med1',
          name: 'Metformin',
          dosage: '500mg',
          frequency: '2x daily',
          route: 'oral',
          timing: 'After meals'
        },
        {
          id: 'med2',
          name: 'Insulin Glargine',
          dosage: '20 units',
          frequency: 'Once daily',
          route: 'injection',
          timing: 'Bedtime'
        }
      ],
      doctorInstructions: [
        {
          id: 'inst1',
          instruction: 'Administer insulin injection at 9 PM',
          priority: 'HIGH',
          dueTime: '21:00',
          createdAt: new Date().toISOString(),
          createdBy: 'Dr. Anderson'
        },
        {
          id: 'inst2',
          instruction: 'Check blood glucose before meals',
          priority: 'MEDIUM',
          createdAt: new Date().toISOString(),
          createdBy: 'Dr. Anderson'
        }
      ],
      reports: [],
      allergies: ['Sulfa drugs'],
      notes: 'Patient is stable and requires medication management only. No continuous monitoring needed.',
      messages: [
        {
          id: 'msg1',
          patientId: 'p3',
          role: 'DOCTOR',
          userName: 'Dr. Anderson',
          message: 'Please ensure insulin is administered at exactly 9 PM. Patient has been compliant with medication schedule.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'COMMENT'
        },
        {
          id: 'msg2',
          patientId: 'p3',
          role: 'NURSE',
          userName: 'Nurse Johnson',
          message: 'Understood. I will administer the insulin at 9 PM and monitor for any adverse reactions.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'REPLY',
          replyTo: 'msg1'
        }
      ]
    }
  }
];

export const getPatients = (): Promise<Patient[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...INITIAL_PATIENTS]), 500);
  });
};
