import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Activity, Shield, Crown, ChevronDown, Clock, Mail, Award, TrendingUp, Brain } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';

interface UserSessionProps {
  userSession: {
    username: string;
    userType: 'patient' | 'admin' | 'guest';
    loginTime: Date;
    id?: string;
    email?: string;
    name?: string;
    accessToken?: string;
  };
  onLogout: () => void;
}

export function UserSession({ userSession, onLogout }: UserSessionProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userStats, setUserStats] = useState({
    assessments: 0,
    healthScore: 0,
    loginStreak: 0,
    lastActivity: null as string | null
  });

  const getUserDisplayName = () => {
    if (!userSession) return "User";
    if (userSession.name && userSession.name !== 'User') {
      return userSession.name;
    }
    const emailPart = userSession.username.split('@')[0];
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).replace('.', ' ');
  };

  const getUserTypeLabel = () => {
    switch (userSession?.userType) {
      case 'admin': return 'Healthcare Professional';
      case 'patient': return 'Patient';
      case 'guest': return 'Guest';
      default: return 'User';
    }
  };

  const getUserTypeIcon = () => {
    switch (userSession?.userType) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'patient': return <Brain className="w-4 h-4" />;
      case 'guest': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    // Simulate loading user stats
    setUserStats({
      assessments: userSession.userType === 'admin' ? 128 : 12,
      healthScore: userSession.userType === 'admin' ? 94 : 78,
      loginStreak: 5,
      lastActivity: new Date().toLocaleString()
    });
  }, [userSession]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 min-w-[200px]"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getInitials()}
        </div>
        
        {/* User Info */}
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900 truncate">
            {getUserDisplayName()}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            {getUserTypeIcon()}
            {getUserTypeLabel()}
          </div>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{getUserDisplayName()}</h3>
                <p className="text-sm text-gray-600">{userSession.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getUserTypeIcon()}
                  <span className="text-xs text-gray-500">{getUserTypeLabel()}</span>
                </div>
              </div>
            </div>
            
            {/* Session Info */}
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Session started: {userSession.loginTime instanceof Date 
                ? userSession.loginTime.toLocaleTimeString()
                : new Date(userSession.loginTime).toLocaleTimeString()
              }
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{userStats.assessments}</div>
                <div className="text-xs text-gray-600">
                  {userSession.userType === 'admin' ? 'Reports' : 'Assessments'}
                </div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{userStats.healthScore}%</div>
                <div className="text-xs text-gray-600">
                  {userSession.userType === 'admin' ? 'Accuracy' : 'Health Score'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button className="w-full flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
              <Activity className="w-4 h-4" />
              Activity History
            </button>
            <button className="w-full flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
              <Award className="w-4 h-4" />
              Achievements
            </button>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}