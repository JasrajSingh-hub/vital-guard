import React from 'react';
import { Activity, ShieldAlert, LayoutDashboard, LogOut, Stethoscope, UserCircle } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentUser: User;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, onLogout }) => {
  const isDoctor = currentUser.role === 'DOCTOR';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VitalGuard AI</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Alerts
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isDoctor ? (
                <Stethoscope className="w-5 h-5 text-blue-600" />
              ) : (
                <UserCircle className="w-5 h-5 text-green-600" />
              )}
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{currentUser.name}</div>
                <div className={`text-xs ${isDoctor ? 'text-blue-600' : 'text-green-600'}`}>
                  {currentUser.role}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
