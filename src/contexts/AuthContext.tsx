import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  preferred_language: string;
  accessToken: string;
  login_count?: number;
  assessment_history?: any[];
  last_assessment?: string;
  signup_date?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  saveAssessment: (assessmentData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Fetch user profile from server
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            ...userData.user,
            accessToken: session.access_token
          });
        }
      }
    } catch (error) {
      console.log('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    // Store basic user info in localStorage for persistence
    localStorage.setItem('cognicare_user', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name
    }));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('cognicare_user');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      // Update localStorage
      localStorage.setItem('cognicare_user', JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }));
    }
  };

  const saveAssessment = async (assessmentData: any): Promise<boolean> => {
    if (!user?.accessToken) {
      console.log('No user token available for saving assessment');
      return false;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/save-assessment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        // Update user's assessment history locally
        const currentHistory = user.assessment_history || [];
        const newAssessment = {
          ...assessmentData,
          timestamp: new Date().toISOString(),
          id: `assessment_${Date.now()}`
        };
        
        const updatedHistory = [...currentHistory, newAssessment];
        if (updatedHistory.length > 10) {
          updatedHistory.splice(0, updatedHistory.length - 10);
        }

        updateUser({
          assessment_history: updatedHistory,
          last_assessment: new Date().toISOString()
        });

        return true;
      } else {
        console.log('Failed to save assessment:', await response.text());
        return false;
      }
    } catch (error) {
      console.log('Error saving assessment:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
    saveAssessment
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}