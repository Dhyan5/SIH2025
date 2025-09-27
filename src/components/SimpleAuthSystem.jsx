import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function SimpleAuthSystem({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check for existing session on mount
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
          onAuthSuccess({
            ...userData.user,
            accessToken: session.access_token
          });
        }
      }
    } catch (error) {
      console.log('Session check error:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return false;
    }

    if (!formData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return false;
    }

    if (mode === 'signup') {
      if (!formData.name) {
        setMessage({ type: 'error', text: 'Please enter your name.' });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return false;
      }
    }

    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      // Create user account on server
      const serverResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          preferredLanguage: 'en'
        })
      });

      const serverResult = await serverResponse.json();

      if (!serverResponse.ok) {
        let errorMessage = serverResult.error || 'Failed to create account';
        if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        }
        setMessage({ type: 'error', text: errorMessage });
        setLoading(false);
        return;
      }

      // Now sign in the user automatically
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Please sign in with your credentials.' 
        });
        setMode('signin');
        setFormData({
          ...formData,
          name: '',
          confirmPassword: '',
          password: ''
        });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: `Welcome to CogniCare, ${formData.name}!` });
      
      setTimeout(() => {
        onAuthSuccess({
          id: serverResult.user.id,
          email: serverResult.user.email,
          name: formData.name,
          preferred_language: 'en',
          accessToken: data.session?.access_token
        });
      }, 1500);

    } catch (error) {
      console.log('Sign up error:', error);
      setMessage({ type: 'error', text: 'An error occurred during registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        let errorMessage = 'Sign in failed. Please check your credentials.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
        setMessage({ type: 'error', text: errorMessage });
        setLoading(false);
        return;
      }

      if (data.session?.access_token) {
        // Track login
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/track-login`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch full user profile
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/profile`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setMessage({ type: 'success', text: `Welcome back, ${userData.user.name || 'User'}!` });
          
          setTimeout(() => {
            onAuthSuccess({
              ...userData.user,
              accessToken: data.session.access_token
            });
          }, 1500);
        } else {
          // Fallback if profile fetch fails
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'User',
            accessToken: data.session.access_token
          });
        }
      }
    } catch (error) {
      console.log('Sign in error:', error);
      setMessage({ type: 'error', text: 'An error occurred during sign in. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setMessage(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '50px auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '30px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '36px',
            marginBottom: '10px'
          }}>🧠</div>
          <h1 style={{
            margin: '0',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>CogniCare</h1>
          <p style={{
            margin: '5px 0 0 0',
            fontSize: '14px',
            opacity: '0.9'
          }}>Cognitive Health Assessment</p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '30px 20px' }}>
          {/* Tab Buttons */}
          <div style={{
            display: 'flex',
            marginBottom: '30px',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <button
              onClick={() => setMode('signin')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'none',
                fontSize: '16px',
                fontWeight: mode === 'signin' ? 'bold' : 'normal',
                color: mode === 'signin' ? '#2563eb' : '#666',
                borderBottom: mode === 'signin' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'none',
                fontSize: '16px',
                fontWeight: mode === 'signup' ? 'bold' : 'normal',
                color: mode === 'signup' ? '#2563eb' : '#666',
                borderBottom: mode === 'signup' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '5px',
              backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#86efac'}`,
              color: message.type === 'error' ? '#dc2626' : '#166534',
              fontSize: '14px'
            }}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
            {mode === 'signup' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#333'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#333'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#333'
              }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '45px',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder={mode === 'signup' ? "Create a password" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {mode === 'signup' && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '5px'
                }}>
                  Must be at least 6 characters long
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#333'
                }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {loading ? (
                <span>
                  {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                <span>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </span>
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            {mode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={switchMode}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                >
                  Sign up here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={switchMode}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          borderTop: '1px solid #e5e5e5'
        }}>
          <div style={{ marginBottom: '10px' }}>
            🔒 Your data is encrypted and secure
          </div>
          <div>
            CogniCare uses enterprise-grade security to protect your health information
          </div>
        </div>
      </div>
    </div>
  );
}