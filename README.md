# VitalGuard AI

A modern healthcare management system for hospitals to monitor patient vitals, manage medications, coordinate care between doctors and nurses, and generate discharge reports.

## Features

### Patient Management
- **Dual Care Modes**: Live monitoring for critical patients and task-based care for stable patients
- **Real-time Vitals Tracking**: Monitor heart rate, blood pressure, SpO2, temperature, and respiratory rate
- **Risk Assessment**: Automatic patient status classification (Stable, Attention, Critical)

### Clinical Workflow
- **Doctor-Nurse Communication**: Built-in messaging system for care coordination
- **Medication Management**: Track active medications with dosage, route, and timing
- **Task Management**: Assign and track nursing tasks linked to doctor instructions
- **Medical Reports**: Upload and manage lab results, X-rays, and other clinical documents

### AI-Powered Insights
- **Vitals Analysis**: Automated risk assessment based on vital signs
- **Patient Summaries**: Generate comprehensive patient status overviews
- **Discharge Reports**: Create detailed discharge summaries with treatment history

### Role-Based Access
- **Doctor View**: Focus on patient overview, AI summaries, and clinical decision support
- **Nurse View**: Prioritize tasks, vitals recording, and medication administration

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Recharts** for vitals visualization
- **Lucide React** for icons
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express
- **lowdb** for local JSON database (no build tools required)
- **Google Gemini AI** for clinical analysis and summaries
- **CORS** enabled for frontend-backend communication

## Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd vitalguard-ai
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Configure environment variables

Create `backend/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_PATH=vitalguard.json
```

5. Seed the database with sample data
```bash
cd backend
npm run seed
```

## Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
Backend runs on `http://localhost:5000`

### Start Frontend Development Server
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## Usage

### Default Login Credentials
- **Doctor**: Username: `doctor`, Password: `doctor123`
- **Nurse**: Username: `nurse`, Password: `nurse123`

### Adding a Patient
1. Click "Add New Patient" on the dashboard
2. Fill in patient details (name, age, gender, room, condition)
3. Select care mode:
   - **Live Monitoring**: For patients requiring continuous vitals tracking
   - **Task-Based Care**: For stable patients with scheduled care tasks

### Recording Vitals (Nurse)
1. Open a monitored patient's detail page
2. Fill in the vitals form with current readings
3. Click "Save & Analyze" to record and get AI risk assessment
4. View vitals trends in the charts below

### Managing Medications
1. Click "Meds & Instructions" button on patient detail page
2. Add medications with dosage, route, frequency, and timing
3. View active medications and delete as needed

### Doctor-Nurse Communication
1. Click "Messages" button on patient detail page
2. Send messages between doctor and nurse
3. Unread message count shown on button badge

### Discharging a Patient
1. Open patient detail page
2. Click discharge button (when implemented)
3. System generates comprehensive discharge report with:
   - Treatment summary
   - Medications administered
   - Vitals history
   - Task completion status
   - AI-generated discharge summary

## Project Structure

```
vitalguard-ai/
├── backend/
│   ├── database-simple.js      # Database operations
│   ├── geminiService.js        # AI integration
│   ├── seed-simple.js          # Sample data seeder
│   ├── server-simple.js        # Express API server
│   ├── package.json
│   └── vitalguard.json         # JSON database (generated)
├── components/                 # React components
├── pages/                      # Page components
├── services/
│   └── apiService.ts          # Frontend API client
├── App.tsx                    # Main app component
├── types.ts                   # TypeScript definitions
└── package.json
```

## API Endpoints

### Patients
- `GET /api/patients` - Get all active patients
- `GET /api/patients/discharged` - Get discharged patients
- `GET /api/patients/:id` - Get patient with full details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient

### Vitals
- `POST /api/patients/:id/vitals` - Add vitals reading

### Medications
- `POST /api/patients/:id/medications` - Add medication
- `DELETE /api/medications/:id` - Remove medication

### Instructions & Tasks
- `POST /api/patients/:id/instructions` - Add doctor instruction
- `POST /api/patients/:id/tasks` - Add nurse task
- `PUT /api/tasks/:id/complete` - Mark task complete

### Communication
- `POST /api/patients/:id/messages` - Send message

### Reports
- `POST /api/patients/:id/reports` - Upload report
- `DELETE /api/reports/:id` - Delete report

### AI Features
- `POST /api/patients/:id/summary` - Generate AI summary

### Discharge
- `POST /api/patients/:id/discharge` - Discharge patient
- `GET /api/patients/:id/discharge-report` - Get discharge report

## Data Persistence

All patient data is stored in `backend/vitalguard.json` and persists across server restarts. The database includes:
- Patient demographics and status
- Vitals history
- Medications
- Doctor instructions
- Nurse tasks
- Messages
- Medical reports
- AI summaries
- Discharge reports

## AI Integration

The system uses Google Gemini AI for:
- **Vitals Analysis**: Evaluates vital signs and assigns risk levels
- **Patient Summaries**: Generates comprehensive status overviews
- **Discharge Summaries**: Creates detailed discharge documentation

All AI outputs are labeled as "AI-ASSISTED" and are for reference only, not medical decision-making.

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## License

This project is for educational and demonstration purposes.

## Notes

- Uses synthetic data only
- Not intended for real clinical use
- AI features require valid Gemini API key
- Backend must be running for frontend to function
