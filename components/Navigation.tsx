import React from 'react';
import {
  Activity,
  LogOut,
  Stethoscope,
  UserCircle,
  HeartPulse,
  ShieldCheck,
  FileCheck2,
  ClipboardList,
  Link2,
  Brain
} from 'lucide-react';
import { AppPage, User } from '../types';

interface NavigationProps {
  currentUser: User;
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, activePage, onNavigate, onLogout }) => {
  const roleMeta = {
    DOCTOR: { label: 'Doctor', color: 'text-sky-700', icon: <Stethoscope className="w-5 h-5 text-sky-700" /> },
    NURSE: { label: 'Nurse', color: 'text-emerald-700', icon: <UserCircle className="w-5 h-5 text-emerald-700" /> },
    PATIENT: { label: 'Patient', color: 'text-rose-700', icon: <HeartPulse className="w-5 h-5 text-rose-700" /> },
    ADMIN: { label: 'Admin', color: 'text-slate-700', icon: <ShieldCheck className="w-5 h-5 text-slate-700" /> }
  } as const;

  const navItems: { id: AppPage; label: string; icon: React.ReactNode; visible: boolean }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <Activity className="w-4 h-4 mr-1" />, visible: currentUser.role !== 'PATIENT' },
    { id: 'PATIENT_PANEL', label: 'My Panel', icon: <HeartPulse className="w-4 h-4 mr-1" />, visible: currentUser.role === 'PATIENT' },
    { id: 'PATIENTS', label: 'Patients', icon: <UserCircle className="w-4 h-4 mr-1" />, visible: currentUser.role !== 'PATIENT' },
    { id: 'CONSENT', label: 'Consent', icon: <FileCheck2 className="w-4 h-4 mr-1" />, visible: currentUser.role === 'PATIENT' },
    { id: 'AUDIT_LOG', label: 'Audit Log', icon: <ClipboardList className="w-4 h-4 mr-1" />, visible: currentUser.role === 'ADMIN' },
    { id: 'BLOCKCHAIN_VERIFY', label: 'Blockchain Verify', icon: <ShieldCheck className="w-4 h-4 mr-1" />, visible: currentUser.role === 'ADMIN' || currentUser.role === 'DOCTOR' },
    { id: 'AI_INSIGHTS', label: 'AI Insights', icon: <Brain className="w-4 h-4 mr-1" />, visible: currentUser.role !== 'PATIENT' },
    { id: 'INTEROPERABILITY', label: 'Interop', icon: <Link2 className="w-4 h-4 mr-1" />, visible: currentUser.role === 'ADMIN' }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-slate-700" />
              <span className="ml-2 text-xl font-bold text-slate-900">VitalGuard AI</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto max-w-[48vw]">
              {navItems.filter((item) => item.visible).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`inline-flex items-center px-2 py-1.5 rounded-md text-sm font-medium ${
                    activePage === item.id
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {roleMeta[currentUser.role].icon}
              <div className="text-sm">
                <div className="font-semibold text-slate-900">{currentUser.name}</div>
                <div className={`text-xs ${roleMeta[currentUser.role].color}`}>{roleMeta[currentUser.role].label} | {currentUser.uid}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
