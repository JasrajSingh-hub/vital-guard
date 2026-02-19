import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Stethoscope, Heart, UserCircle, ShieldCheck } from 'lucide-react';
import { loginUser, signupUser } from '../services/authService';

interface RoleSelectionProps {
  onRoleSelect: (user: User) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const roles: {
    id: UserRole;
    title: string;
    icon: React.ReactNode;
    selectedClass: string;
  }[] = [
    {
      id: 'DOCTOR',
      title: 'Doctor',
      icon: <Stethoscope className="w-6 h-6 text-sky-700" />,
      selectedClass: 'border-sky-600 bg-sky-50'
    },
    {
      id: 'NURSE',
      title: 'Nurse',
      icon: <UserCircle className="w-6 h-6 text-emerald-700" />,
      selectedClass: 'border-emerald-600 bg-emerald-50'
    },
    {
      id: 'PATIENT',
      title: 'Patient',
      icon: <Heart className="w-6 h-6 text-rose-700" />,
      selectedClass: 'border-rose-600 bg-rose-50'
    },
    {
      id: 'ADMIN',
      title: 'Admin',
      icon: <ShieldCheck className="w-6 h-6 text-slate-700" />,
      selectedClass: 'border-slate-600 bg-slate-100'
    }
  ];

  const isValidGmail = (value: string) =>
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Select a role.');
      return;
    }
    if (!isValidGmail(email)) {
      setError('Enter a valid Gmail address.');
      return;
    }

    if (mode === 'SIGNUP') {
      if (!name.trim()) {
        setError('Enter your name.');
        return;
      }
      const result = signupUser({
        name: name.trim(),
        email: email.trim(),
        role: selectedRole
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.user.approvalStatus === 'PENDING') {
        setMode('LOGIN');
        setError('Signup complete. Wait for admin approval, then login.');
        return;
      }
      onRoleSelect({ name: result.user.name, email: result.user.email, role: result.user.role });
      return;
    }

    const loginResult = loginUser({ email: email.trim(), role: selectedRole });
    if (!loginResult.ok) {
      setError(loginResult.error);
      return;
    }
    onRoleSelect(loginResult.user);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-xl w-full p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">VitalGuard Care</h1>
          <p className="text-slate-600 text-sm mt-1">Secure role-based healthcare access</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setMode('LOGIN');
              setError('');
            }}
            className={`py-2 text-sm rounded-md font-semibold ${
              mode === 'LOGIN' ? 'bg-white text-slate-900' : 'text-slate-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('SIGNUP');
              setError('');
            }}
            className={`py-2 text-sm rounded-md font-semibold ${
              mode === 'SIGNUP' ? 'bg-white text-slate-900' : 'text-slate-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role / Title</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${
                    selectedRole === role.id
                      ? role.selectedClass
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {role.icon}
                  <span className="font-medium">{role.title}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gmail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            {mode === 'LOGIN' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleSelection;
