import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client with service role for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ce6e168a/health", (c) => {
  return c.json({ status: "ok" });
});

// Enhanced DHYAN user registration endpoint
app.post("/make-server-ce6e168a/signup", async (c) => {
  try {
    const { email, password, name, age, preferredLanguage } = await c.req.json();

    // Enhanced validation
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters long" }, 400);
    }

    if (name.trim().length < 2) {
      return c.json({ error: "Name must be at least 2 characters long" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Please enter a valid email address" }, 400);
    }

    console.log(`Creating DHYAN user account for: ${email}`);

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      user_metadata: {
        name: name.trim(),
        age: age || null,
        preferred_language: preferredLanguage || 'en',
        platform: 'DHYAN',
        created_via: 'dhyan_auth_system',
        registration_date: new Date().toISOString()
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Supabase user creation error:', error);
      
      if (error.message.includes('User already registered')) {
        return c.json({ error: "An account with this email already exists. Please sign in instead." }, 400);
      }
      
      if (error.message.includes('Password should be at least 6 characters')) {
        return c.json({ error: "Password must be at least 6 characters long" }, 400);
      }
      
      return c.json({ error: error.message || "Failed to create account" }, 400);
    }

    // Store comprehensive user profile data in KV store
    const userId = data.user.id;
    const now = new Date().toISOString();
    
    const userProfile = {
      id: userId,
      email: email.toLowerCase(),
      name: name.trim(),
      age: age || null,
      preferred_language: preferredLanguage || 'en',
      platform: 'DHYAN',
      signup_date: now,
      login_count: 1,
      last_login: now,
      assessment_history: [],
      last_assessment: null,
      health_score: 0,
      total_sessions: 1,
      streak_days: 1,
      is_active: true,
      account_type: 'standard',
      privacy_settings: {
        data_sharing: false,
        analytics: true,
        notifications: true
      },
      onboarding_completed: false
    };

    await kv.set(`user_profile:${userId}`, userProfile);
    await kv.set(`dhyan_user:${email.toLowerCase()}`, userId);
    
    // Track registration metrics
    const registrationMetrics = await kv.get('dhyan_registration_metrics') || { total: 0, today: 0, last_reset: now.split('T')[0] };
    const today = now.split('T')[0];
    
    if (registrationMetrics.last_reset !== today) {
      registrationMetrics.today = 0;
      registrationMetrics.last_reset = today;
    }
    
    registrationMetrics.total += 1;
    registrationMetrics.today += 1;
    
    await kv.set('dhyan_registration_metrics', registrationMetrics);
    
    console.log(`DHYAN user profile created successfully for: ${email} (Total users: ${registrationMetrics.total})`);

    return c.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: userId,
        email: data.user.email,
        name: name.trim(),
        age: age || null,
        preferred_language: preferredLanguage || 'en',
        platform: 'DHYAN',
        created_at: now
      }
    });

  } catch (error) {
    console.log('DHYAN registration error:', error);
    return c.json({ error: "Registration failed. Please try again." }, 500);
  }
});

// Get user profile
app.get("/make-server-ce6e168a/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    // Get user from Supabase using the access token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Auth error:', error);
      return c.json({ error: "Invalid access token" }, 401);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user_profile:${user.id}`);
    
    if (!userProfile) {
      // Create basic profile if it doesn't exist
      const basicProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'User',
        age: user.user_metadata?.age || null,
        preferred_language: user.user_metadata?.preferred_language || 'en',
        signup_date: new Date().toISOString(),
        login_count: 0,
        last_login: null,
        assessment_history: [],
        last_assessment: null
      };
      
      await kv.set(`user_profile:${user.id}`, basicProfile);
      return c.json({ user: basicProfile });
    }

    return c.json({ user: userProfile });

  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Enhanced DHYAN user login tracking
app.post("/make-server-ce6e168a/track-login", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Auth error in login tracking:', error);
      return c.json({ error: "Invalid access token" }, 401);
    }

    // Get or initialize user profile
    let userProfile = await kv.get(`user_profile:${user.id}`) || {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 'User',
      platform: 'DHYAN',
      signup_date: new Date().toISOString(),
      login_count: 0,
      total_sessions: 0,
      streak_days: 0,
      last_login: null,
      assessment_history: [],
      health_score: 0,
      is_active: true
    };

    const now = new Date();
    const nowISO = now.toISOString();
    const lastLogin = userProfile.last_login ? new Date(userProfile.last_login) : null;
    
    // Update login metrics
    userProfile.login_count = (userProfile.login_count || 0) + 1;
    userProfile.last_login = nowISO;
    userProfile.total_sessions = (userProfile.total_sessions || 0) + 1;
    userProfile.is_active = true;
    
    // Enhanced streak calculation
    if (lastLogin) {
      const diffMs = now.getTime() - lastLogin.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Same day login - maintain streak
        userProfile.streak_days = userProfile.streak_days || 1;
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        userProfile.streak_days = (userProfile.streak_days || 1) + 1;
      } else if (diffDays > 1) {
        // Streak broken - reset to 1
        userProfile.streak_days = 1;
      }
    } else {
      // First login
      userProfile.streak_days = 1;
    }

    // Track session info
    userProfile.last_session_info = {
      timestamp: nowISO,
      user_agent: c.req.header('User-Agent') || 'Unknown',
      platform: 'DHYAN'
    };

    await kv.set(`user_profile:${user.id}`, userProfile);
    
    // Update global login metrics
    const loginMetrics = await kv.get('dhyan_login_metrics') || { 
      total_logins: 0, 
      daily_logins: 0, 
      unique_users_today: new Set(),
      last_reset: nowISO.split('T')[0] 
    };
    
    const today = nowISO.split('T')[0];
    
    if (loginMetrics.last_reset !== today) {
      loginMetrics.daily_logins = 0;
      loginMetrics.unique_users_today = new Set();
      loginMetrics.last_reset = today;
    }
    
    loginMetrics.total_logins += 1;
    loginMetrics.daily_logins += 1;
    loginMetrics.unique_users_today.add(user.id);
    
    await kv.set('dhyan_login_metrics', {
      ...loginMetrics,
      unique_users_today: Array.from(loginMetrics.unique_users_today) // Convert Set to Array for storage
    });
    
    console.log(`DHYAN login tracked for ${user.email}: Streak ${userProfile.streak_days} days, Total logins: ${userProfile.login_count}`);

    return c.json({ 
      success: true,
      user_stats: {
        login_count: userProfile.login_count,
        streak_days: userProfile.streak_days,
        total_sessions: userProfile.total_sessions,
        health_score: userProfile.health_score || 0
      },
      session_info: {
        login_time: nowISO,
        platform: 'DHYAN'
      }
    });

  } catch (error) {
    console.log('DHYAN login tracking error:', error);
    return c.json({ error: "Failed to track login" }, 500);
  }
});

// Update user profile
app.post("/make-server-ce6e168a/update-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const { name, age, preferred_language } = await c.req.json();

    // Get current profile
    const userProfile = await kv.get(`user_profile:${user.id}`) || {};
    
    // Update profile fields
    if (name) userProfile.name = name;
    if (age !== undefined) userProfile.age = age;
    if (preferred_language) userProfile.preferred_language = preferred_language;

    // Save updated profile
    await kv.set(`user_profile:${user.id}`, userProfile);

    return c.json({ success: true, user: userProfile });

  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Save assessment results
app.post("/make-server-ce6e168a/save-assessment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const assessmentData = await c.req.json();

    // Get current profile
    const userProfile = await kv.get(`user_profile:${user.id}`) || {};
    
    // Initialize assessment history if it doesn't exist
    if (!userProfile.assessment_history) {
      userProfile.assessment_history = [];
    }

    // Add new assessment
    const newAssessment = {
      ...assessmentData,
      timestamp: new Date().toISOString(),
      id: `assessment_${Date.now()}`
    };

    userProfile.assessment_history.push(newAssessment);
    
    // Keep only last 10 assessments
    if (userProfile.assessment_history.length > 10) {
      userProfile.assessment_history = userProfile.assessment_history.slice(-10);
    }

    // Update last assessment date
    userProfile.last_assessment = new Date().toISOString();

    // Save updated profile
    await kv.set(`user_profile:${user.id}`, userProfile);

    return c.json({ success: true });

  } catch (error) {
    console.log('Assessment save error:', error);
    return c.json({ error: "Failed to save assessment" }, 500);
  }
});

// Get user assessment history
app.get("/make-server-ce6e168a/assessments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    // Get user profile
    const userProfile = await kv.get(`user_profile:${user.id}`);
    
    if (!userProfile) {
      return c.json({ assessments: [] });
    }

    return c.json({ 
      assessments: userProfile.assessment_history || [],
      total_count: (userProfile.assessment_history || []).length,
      last_assessment: userProfile.last_assessment
    });

  } catch (error) {
    console.log('Assessment history error:', error);
    return c.json({ error: "Failed to fetch assessments" }, 500);
  }
});

// Enhanced DHYAN logout endpoint
app.post("/make-server-ce6e168a/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Auth error in logout:', error);
      // Still return success for security reasons
      return c.json({ success: true, message: "Logged out successfully" });
    }

    // Update user profile with logout info
    const userProfile = await kv.get(`user_profile:${user.id}`);
    if (userProfile) {
      userProfile.last_logout = new Date().toISOString();
      userProfile.session_active = false;
      
      // Calculate session duration
      if (userProfile.last_login) {
        const loginTime = new Date(userProfile.last_login);
        const logoutTime = new Date();
        const sessionDuration = Math.floor((logoutTime.getTime() - loginTime.getTime()) / 1000 / 60); // minutes
        
        userProfile.last_session_duration = sessionDuration;
        userProfile.total_session_time = (userProfile.total_session_time || 0) + sessionDuration;
      }
      
      await kv.set(`user_profile:${user.id}`, userProfile);
    }

    console.log(`DHYAN user logged out: ${user.email}`);

    return c.json({ 
      success: true, 
      message: "Logged out successfully from DHYAN",
      logged_out_at: new Date().toISOString()
    });

  } catch (error) {
    console.log('DHYAN logout error:', error);
    return c.json({ success: true, message: "Logged out successfully" }); // Always return success for security
  }
});

// DHYAN system health check
app.get("/make-server-ce6e168a/system-health", async (c) => {
  try {
    const metrics = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      platform: "DHYAN",
      database_connection: "active",
      auth_service: "operational"
    };

    // Get basic system metrics
    try {
      const registrationMetrics = await kv.get('dhyan_registration_metrics');
      const loginMetrics = await kv.get('dhyan_login_metrics');
      
      if (registrationMetrics) {
        metrics.total_users = registrationMetrics.total;
        metrics.users_today = registrationMetrics.today;
      }
      
      if (loginMetrics) {
        metrics.total_logins = loginMetrics.total_logins;
        metrics.daily_logins = loginMetrics.daily_logins;
      }
    } catch (metricsError) {
      console.warn('Failed to fetch system metrics:', metricsError);
    }

    return c.json(metrics);
  } catch (error) {
    console.log('System health check error:', error);
    return c.json({ 
      status: "degraded", 
      timestamp: new Date().toISOString(),
      error: "System health check failed" 
    }, 500);
  }
});

Deno.serve(app.fetch);