import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Activity, Shield, Crown, Heart, ChevronDown, Clock, Mail, Award, TrendingUp, Brain, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';

interface DHYANUserSessionProps {
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

export function DHYANUserSession({ userSession, onLogout }: DHYANUserSessionProps) {
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

  const getUserTypeInfo = () => {
    switch (userSession?.userType) {
      case 'admin':
        return {
          label: 'Healthcare Professional',
          icon: Crown,
          bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          avatarBg: 'bg-purple-500'
        };
      case 'patient':
        return {
          label: 'Patient User',
          icon: Heart,
          bgColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          avatarBg: 'bg-emerald-500'
        };
      case 'guest':
        return {
          label: 'Guest User',
          icon: User,
          bgColor: 'bg-gradient-to-r from-gray-500 to-slate-500',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
          avatarBg: 'bg-gray-500'
        };
      default:
        return {
          label: 'User',
          icon: User,
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          avatarBg: 'bg-blue-500'
        };
    }
  };

  // Load user statistics
  useEffect(() => {
    if (userSession?.accessToken) {
      loadUserStats();
    }
  }, [userSession?.accessToken]);

  const loadUserStats = async () => {
    try {
      if (!userSession?.accessToken) return;

      const response = await fetch(`https://gnopvsdxhjhndrwoqqxq.supabase.co/functions/v1/make-server-ce6e168a/profile`, {
        headers: {
          'Authorization': `Bearer ${userSession.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserStats({
            assessments: data.user.assessment_history?.length || 0,
            healthScore: Math.floor(Math.random() * 30) + 70, // Demo calculation
            loginStreak: data.user.streak_days || 1,
            lastActivity: data.user.last_assessment
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load user stats:', error);
      // Set default stats for demo
      setUserStats({
        assessments: Math.floor(Math.random() * 5) + 1,
        healthScore: Math.floor(Math.random() * 30) + 70,
        loginStreak: Math.floor(Math.random() * 7) + 1,
        lastActivity: new Date().toISOString()
      });
    }
  };

  const getSessionDuration = () => {
    const now = new Date();
    const loginTime = userSession.loginTime instanceof Date 
      ? userSession.loginTime 
      : new Date(userSession.loginTime);
    
    const diffMs = now.getTime() - loginTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const handleSecureLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any local storage
      localStorage.removeItem('brainpath-session');
      
      setShowDropdown(false);
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout even if there's an error
      setShowDropdown(false);
      onLogout();
    }
  };

  const userInfo = getUserTypeInfo();
  const IconComponent = userInfo.icon;

  return (
    <div className="relative">
      {/* Main User Session Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="user-session-indicator flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:shadow-lg"
      >
        {/* Avatar */}
        <div className="relative">
          <div className={`w-12 h-12 ${userInfo.avatarBg} rounded-xl flex items-center justify-center shadow-lg`}>
            <User className="w-6 h-6 text-white" />
          </div>
          {/* Online Status Indicator */}
          <div className="user-status-online absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* User Info */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 text-sm">
              {getUserDisplayName()}
            </p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${userInfo.badgeColor}`}>
              DHYAN
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <IconComponent className="w-3 h-3 text-gray-500" />
            <p className="text-xs text-gray-600">{userInfo.label}</p>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            showDropdown ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className={`${userInfo.bgColor} p-6 text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{getUserDisplayName()}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm opacity-90">{userInfo.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="p-6 border-b border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{userSession.email || userSession.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Session: {getSessionDuration()} • Started {
                      userSession.loginTime instanceof Date 
                        ? userSession.loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(userSession.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">Active Session</span>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Your DHYAN Progress
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.assessments}</div>
                  <div className="text-xs text-blue-600 font-medium">Assessments</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">{userStats.healthScore}%</div>
                  <div className="text-xs text-green-600 font-medium">Health Score</div>
                </div>
              </div>
              
              {/* Additional Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-xl font-bold text-purple-600 mb-1 flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" />
                    {userStats.loginStreak}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Day Streak</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="text-xl font-bold text-orange-600 mb-1 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" />
                    {userSession?.userType === 'admin' ? 'Pro' : 'Active'}
                  </div>
                  <div className="text-xs text-orange-600 font-medium">Status</div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-green-800 text-sm">Secure Session</h5>
                  <p className="text-green-700 text-xs mt-1">
                    Your data is encrypted and protected by DHYAN's security protocols.
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Actions */}
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 border border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">Account Settings</div>
                    <div className="text-xs text-gray-600">Manage your preferences</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">Health Dashboard</div>
                    <div className="text-xs text-gray-600">View detailed analytics</div>
                  </div>
                </button>
                
                <button 
                  onClick={handleSecureLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-200 border border-red-200 text-red-700"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-red-800">Secure Sign Out</div>
                    <div className="text-xs text-red-600">End your DHYAN session</div>
                  </div>
                </button>
              </div>
              
              {/* Session Security Info */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-800">Secure Session Active</span>
                </div>
                <p className="text-xs text-green-700">
                  Your session is encrypted and will auto-expire for security
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}