import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.access_token) {
          await fetchUserProfile(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('cognicare_user');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const userWithToken = {
          ...userData.user,
          accessToken
        };
        setUser(userWithToken);
        
        // Store basic user info in localStorage for persistence
        localStorage.setItem('cognicare_user', JSON.stringify({
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.name
        }));
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
    }
  };

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetchUserProfile(session.access_token);
      }
    } catch (error) {
      console.log('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('Logout error:', error);
      }
      
      setUser(null);
      localStorage.removeItem('cognicare_user');
    } catch (error) {
      console.log('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      localStorage.removeItem('cognicare_user');
    }
  };

  const updateUser = (updatedUser) => {
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

  const saveAssessment = async (assessmentData) => {
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
        const errorText = await response.text();
        console.log('Failed to save assessment:', errorText);
        return false;
      }
    } catch (error) {
      console.log('Error saving assessment:', error);
      return false;
    }
  };

  const getAssessmentHistory = async () => {
    if (!user?.accessToken) {
      return [];
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/assessments`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.assessments || [];
      }
    } catch (error) {
      console.log('Error fetching assessment history:', error);
    }
    
    return [];
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    saveAssessment,
    getAssessmentHistory,
    supabase // Expose supabase client for direct use if needed
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