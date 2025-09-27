import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { BrainLogo, BrainIcon } from './BrainLogo';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function ProfessionalAuthSystem({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check connection and existing session on mount
  useEffect(() => {
    checkConnectionAndSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        handleSuccessfulAuth(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkConnectionAndSession = async () => {
    try {
      setConnectionStatus('checking');
      
      // First check if we can connect to Supabase
      const { error: connectionError } = await supabase.auth.getSession();
      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`);
      }
      
      setConnectionStatus('connected');
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await handleSuccessfulAuth(session);
      }
    } catch (error) {
      console.error('Connection/Session check error:', error);
      setConnectionStatus('error');
      setMessage({ 
        type: 'error', 
        text: 'Unable to connect to authentication service. Please check your internet connection and try again.' 
      });
    }
  };

  const handleSuccessfulAuth = async (session) => {
    try {
      // Try to get full user profile from server
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
      } else {
        // Fallback to basic user data
        onAuthSuccess({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
          accessToken: session.access_token
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Still authenticate with basic data
      onAuthSuccess({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
        accessToken: session.access_token
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any existing messages when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const validateForm = () => {
    // Reset any previous messages
    setMessage(null);

    if (!formData.email?.trim() || !formData.password?.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return false;
    }

    if (isSignUp) {
      if (!formData.name?.trim()) {
        setMessage({ type: 'error', text: 'Please enter your full name.' });
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
      // First try to create user account on server
      const serverResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          preferredLanguage: 'en'
        })
      });

      if (!serverResponse.ok) {
        const serverResult = await serverResponse.json();
        let errorMessage = serverResult.error || 'Failed to create account';
        
        if (errorMessage.includes('User already registered') || errorMessage.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          setIsSignUp(false);
          setFormData(prev => ({ ...prev, name: '', confirmPassword: '' }));
        }
        
        setMessage({ type: 'error', text: errorMessage });
        setLoading(false);
        return;
      }

      // Now sign in the user automatically
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.log('Auto sign-in after signup failed:', error);
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Please sign in with your credentials.' 
        });
        setIsSignUp(false);
        setFormData({
          name: '',
          email: formData.email,
          password: '',
          confirmPassword: ''
        });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: `Welcome to BrainPath, ${formData.name}!` });
      
      // Session will be handled by auth state listener
      
    } catch (error) {
      console.error('Sign up error:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred during registration. Please check your connection and try again.' 
      });
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
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        let errorMessage = 'Sign in failed. Please check your credentials.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account first.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        }
        
        setMessage({ type: 'error', text: errorMessage });
        setLoading(false);
        return;
      }

      if (data.session?.access_token) {
        // Track login attempt
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ce6e168a/track-login`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (trackError) {
          console.log('Login tracking failed:', trackError);
          // Don't fail the login for tracking errors
        }

        setMessage({ type: 'success', text: 'Welcome back!' });
        
        // Session will be handled by auth state listener
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred during sign in. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoType) => {
    setLoading(true);
    setMessage(null);

    const demoCredentials = {
      patient: { email: 'demo.patient@brainpath.com', password: 'demo123', name: 'Demo Patient' },
      admin: { email: 'demo.admin@brainpath.com', password: 'demo123', name: 'Demo Admin' }
    };

    const creds = demoCredentials[demoType];
    if (!creds) {
      setMessage({ type: 'error', text: 'Invalid demo account type.' });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });

      if (error) {
        console.error('Demo login error:', error);
        setMessage({ 
          type: 'error', 
          text: 'Demo account temporarily unavailable. Please create a new account or try again later.' 
        });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: `Signed in as ${creds.name}` });
      
      // Session will be handled by auth state listener
      
    } catch (error) {
      console.error('Demo login error:', error);
      setMessage({ type: 'error', text: 'Demo login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setMessage(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Show loading screen while checking connection
  if (connectionStatus === 'checking') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: '"Segoe UI", Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #4299e1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#6c757d' }}>Connecting to BrainPath...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comfortable-page" style={{
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e8e5e0',
        padding: '24px 0',
        marginBottom: '40px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            marginRight: '15px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid #e8e5e0',
            boxShadow: '0 2px 8px rgba(66, 153, 225, 0.1)'
          }}>
            <BrainLogo width={36} height={36} color="#4299e1" />
          </div>
          <div>
            <h1 style={{
              margin: '0',
              fontSize: '28px',
              fontWeight: '700',
              color: '#2d3748',
              letterSpacing: '-0.5px'
            }}>BrainPath</h1>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: '#718096',
              fontWeight: '400'
            }}>Cognitive Health Assessment Platform</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus === 'error' && (
        <div style={{
          maxWidth: '450px',
          margin: '0 auto 20px',
          backgroundColor: '#fed7d7',
          border: '1px solid #fc8181',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#c53030', margin: '0 0 15px 0', fontWeight: '600' }}>
            Connection Error
          </p>
          <p style={{ color: '#c53030', margin: '0 0 15px 0', fontSize: '14px' }}>
            Unable to connect to authentication service. Please check your internet connection.
          </p>
          <button
            onClick={checkConnectionAndSession}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="comfortable-container">
        {/* Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#2d3748'
          }}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p style={{
            margin: '0',
            fontSize: '14px',
            color: '#718096'
          }}>
            {isSignUp ? 'Register for a new BrainPath account' : 'Access your BrainPath account'}
          </p>
        </div>

        {/* Demo Accounts */}
        {!isSignUp && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <p style={{
              margin: '0 0 15px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#0369a1',
              textAlign: 'center'
            }}>
              Try BrainPath with Demo Accounts
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={() => handleDemoLogin('patient')}
                disabled={loading || connectionStatus === 'error'}
                className="demo-account-button"
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #0369a1',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Demo Patient
              </button>
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={loading || connectionStatus === 'error'}
                className="demo-account-button"
                style={{
                  backgroundColor: '#e9d5ff',
                  color: '#7c3aed',
                  border: '1px solid #7c3aed',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Demo Admin
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div style={{
            padding: '16px',
            marginBottom: '20px',
            backgroundColor: message.type === 'error' ? '#fed7d7' : '#d0fdf4',
            border: `1px solid ${message.type === 'error' ? '#fc8181' : '#6ee7b7'}`,
            borderRadius: '12px',
            color: message.type === 'error' ? '#c53030' : '#065f46',
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="comfortable-form">
          {isSignUp && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '14px',
                color: '#4a5568'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className="comfortable-input"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '14px',
              color: '#4a5568'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className="comfortable-input"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              fontSize: '14px',
              color: '#4a5568'
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
                className="comfortable-input"
                style={{ paddingRight: '50px' }}
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {isSignUp && (
              <div style={{
                fontSize: '12px',
                color: '#718096',
                marginTop: '6px'
              }}>
                Must be at least 6 characters long
              </div>
            )}
          </div>

          {isSignUp && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '14px',
                color: '#4a5568'
              }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="comfortable-input"
                  style={{ paddingRight: '50px' }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="password-toggle"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || connectionStatus === 'error'}
            className="comfortable-button"
            style={{
              opacity: (loading || connectionStatus === 'error') ? 0.6 : 1,
              cursor: (loading || connectionStatus === 'error') ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              <span>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#718096',
          borderTop: '1px solid #e8e5e0',
          paddingTop: '20px'
        }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={switchMode}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4299e1',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Sign in here
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                onClick={switchMode}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4299e1',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Create one here
              </button>
            </span>
          )}
        </div>

        {/* Security Notice */}
        <div className="secure-indicator" style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '8px', fontSize: '16px' }}>
            🔒
          </div>
          <div>
            BrainPath uses enterprise-grade security to protect your health information
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '12px',
        color: '#718096'
      }}>
        <p>© 2024 BrainPath - Professional Cognitive Health Assessment</p>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}