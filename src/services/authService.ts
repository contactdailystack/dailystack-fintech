/**
 * DailyStack — Auth Service (v2)
 * Unified Smart Auth with Google, Apple, Email OTP, and Email+Password
 * 
 * Features:
 * - Unified auth flow (auto-detect existing/new user)
 * - Google Login (disabled - not ready)
 * - Apple Login (disabled - not ready)
 * - Email OTP (existing)
 * - Email + Password (NEW)
 * - Session management with auto-login
 * - Progressive profiling support
 * - Photo upload support
 */

import { supabase } from '../app/services/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AuthProvider = 'google' | 'apple' | 'email';
export type AuthFlow = 'login' | 'signup';

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session | null;
  isNewUser: boolean;
  flow: AuthFlow;
  error?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  nickname?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  
  // Demographics
  birth_month?: number | null;
  birth_year?: number | null;
  age?: number | null;
  gender?: string;
  location?: string;
  
  // Photos
  dating_photos?: string[];
  
  // Lifestyle & Preferences
  relationship_goals?: string;
  sleep_schedule?: string;
  work_style?: string;
  social_energy?: string;
  
  // Extended Profile
  interests?: string[];
  occupation?: string;
  education?: string;
  mbti?: string;
  
  // Settings
  dating_enabled?: boolean;
  show_online_status?: boolean;
  
  // Status & Progression
  is_premium?: boolean;
  premium_tier?: string;
  premium_expires_at?: string | null;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  profile_completion_percent?: number;
  ai_profile_completion?: number;
  
  // Account Status (Soft Delete)
  account_status?: string;
  deleted_at?: string | null;
  
  // Auth
  auth_provider?: string;
  
  // Timestamps
  created_at: string;
  last_login_at: string;
  updated_at?: string;
}

// ─── Auth State ────────────────────────────────────────────────────────────────
let currentSession: Session | null = null;
let currentUser: User | null = null;

// ─── Auth Log Types ─────────────────────────────────────────────────────────────

interface AuthLog {
  id: string;
  user_id: string;
  login_method: string;
  ip_address?: string;
  device_info?: string;
  login_at: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Check if user exists by email or provider
 */
const checkUserExists = async (email?: string, googleId?: string, appleId?: string): Promise<User | null> => {
  try {
    // Check by email first
    if (email) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (userByEmail) return userByEmail;
    }

    // Check by Google ID
    if (googleId) {
      const { data: userByGoogle } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .single();
      
      if (userByGoogle) return userByGoogle;
    }

    // Check by Apple ID
    if (appleId) {
      const { data: userByApple } = await supabase
        .from('users')
        .select('*')
        .eq('apple_id', appleId)
        .single();
      
      if (userByApple) return userByApple;
    }

    return null;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return null;
  }
};

/**
 * Detect auth flow based on user existence
 */
export const detectAuthFlow = async (email?: string): Promise<AuthFlow> => {
  const existingUser = await checkUserExists(email);
  return existingUser ? 'login' : 'signup';
};

// ─── Email + Password Auth (OTP-based Sign Up) ─────────────────────────────────

/**
 * Sign Up with Email + OTP
 * User enters email → OTP is sent → User verifies → Account created
 */
export const signUpWithEmail = async (
  email: string,
  nickname?: string
): Promise<AuthResult> => {
  try {
    // Check if user already exists
    const existingUser = await checkUserExists(email);
    
    if (existingUser) {
      return {
        success: false,
        isNewUser: false,
        flow: 'login',
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }

    // Send OTP for sign up
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        data: {
          nickname: nickname || email.split('@')[0],
          auth_flow: 'signup',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('AuthService.signUpWithEmail error:', error);
      throw error;
    }

    // OTP sent successfully - account will be created when OTP is verified
    return {
      success: true,
      isNewUser: true,
      flow: 'signup',
    };
  } catch (error: any) {
    console.error('AuthService.signUpWithEmail catch error:', error);
    return {
      success: false,
      isNewUser: false,
      flow: 'signup',
      error: error.message || 'Failed to send verification code',
    };
  }
};

/**
 * Verify OTP and complete sign up
 */
export const verifySignUpOtp = async (
  email: string,
  token: string
): Promise<AuthResult> => {
  try {
    // Verify the OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token,
      type: 'signup',
    });

    if (error) {
      console.error('AuthService.verifySignUpOtp error:', error);
      throw error;
    }

    const user = data.user;
    const session = data.session;

    if (!user) {
      throw new Error('Verification failed');
    }

    // Profile will be automatically created by DB trigger handle_new_user
    // No need to manually insert here

    currentSession = session;
    currentUser = user;

    return {
      success: true,
      user,
      session,
      isNewUser: true,
      flow: 'signup',
    };
  } catch (error: any) {
    console.error('AuthService.verifySignUpOtp catch error:', error);
    return {
      success: false,
      isNewUser: false,
      flow: 'signup',
      error: error.message || 'Invalid verification code',
    };
  }
};

/**
 * Sign in with Email + Password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const signInResponse = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    const data = signInResponse.data as { user: User | null; session: Session | null };
    const error = signInResponse.error;

    const user = data?.user ?? data?.session?.user;

    if (error) {
      console.error('AuthService.signInWithEmail error:', error);
      throw error;
    }
    if (!user) {
      console.error('AuthService.signInWithEmail: no user in response', { data });
      throw new Error('Failed to sign in');
    }

    // Update last login (no need to create profile - already exists from signup)
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    currentSession = data.session;
    currentUser = user;

    return {
      success: true,
      user,
      session: data.session,
      isNewUser: false,
      flow: 'login',
    };
  } catch (error: any) {
    return {
      success: false,
      isNewUser: false,
      flow: 'login',
      error: error.message || 'Invalid email or password',
    };
  }
};

/**
 * Forgot Password - Send reset email
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send reset email' };
  }
};

/**
 * Reset Password with token
 */
export const resetPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reset password' };
  }
};

// ─── Google Auth (DISABLED - Not Ready) ───────────────────────────────────────

export const signInWithGoogle = async (): Promise<AuthResult> => {
  return {
    success: false,
    isNewUser: false,
    flow: 'login',
    error: 'Google Login is not available yet. Please use email to sign up or sign in.',
  };
};

export const handleGoogleCallback = async (): Promise<AuthResult> => {
  return {
    success: false,
    isNewUser: false,
    flow: 'login',
    error: 'Google Login is not available yet',
  };
};

// ─── Apple Auth (DISABLED - Not Ready) ────────────────────────────────────────

export const signInWithApple = async (): Promise<AuthResult> => {
  return {
    success: false,
    isNewUser: false,
    flow: 'login',
    error: 'Apple Login is not available yet. Please use email to sign up or sign in.',
  };
};

// ─── Email OTP Auth (Existing) ────────────────────────────────────────────────

/**
 * Send OTP to email
 * Auto-detects if user exists and shows appropriate message
 */
export const sendEmailOtp = async (email: string, nickname?: string): Promise<AuthResult> => {
  try {
    // Check if user exists
    const existingUser = await checkUserExists(email);
    const flow = existingUser ? 'login' : 'signup';

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        data: {
          nickname,
          auth_flow: flow,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return {
      success: true,
      isNewUser: !existingUser,
      flow,
    };
  } catch (error: any) {
    return {
      success: false,
      isNewUser: false,
      flow: 'signup',
      error: error.message || 'Failed to send OTP',
    };
  }
};

/**
 * Verify OTP
 * Note: Profile (users, discovery_profiles, user_match_limits) is automatically
 * created by DB trigger handle_new_user when a new user verifies OTP.
 */
export const verifyEmailOtp = async (email: string, token: string): Promise<AuthResult> => {
  try {
    const { data: { user, session }, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token,
      type: 'email',
    });

    if (error) throw error;
    if (!user) throw new Error('Verification failed');

    // Check if user already existed in our users table (not new = login flow)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, created_at')
      .eq('id', user.id)
      .single();

    const isNewUser = !existingUser;

    // Profile will be automatically created by DB trigger handle_new_user (for new users)
    // For existing users, no action needed

    currentSession = session;
    currentUser = user;

    return {
      success: true,
      user,
      session,
      isNewUser,
      flow: isNewUser ? 'signup' : 'login',
    };
  } catch (error: any) {
    return {
      success: false,
      isNewUser: false,
      flow: 'login',
      error: error.message || 'Invalid OTP',
    };
  }
};

// ─── Session Management ────────────────────────────────────────────────────────

/**
 * Get current session
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (!data || !session) throw new Error('No session found');

    currentSession = session;
    return session;
  } catch (error) {
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    currentUser = user;
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user is authenticated (auto-login)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};

/**
 * Auto-login with existing session
 * Returns user if session is valid, null otherwise
 */
export const autoLogin = async (): Promise<User | null> => {
  const session = await getCurrentSession();
  
  if (!session) return null;

  // Check if access token is expired
  const expiresAt = session.expires_at;
  const now = Date.now() / 1000;
  
  if (expiresAt && expiresAt < now) {
    // Token expired, try refresh
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // Refresh failed, clear session
      await signOut();
      return null;
    }
    
    currentUser = user;
    return user;
  }

  // Token valid, get user
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  return user;
};

/**
 * Refresh session silently
 */
export const refreshSession = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.refreshSession();
    return !error;
  } catch (error) {
    return false;
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
  currentSession = null;
  currentUser = null;
};

// ─── User Profile Management ───────────────────────────────────────────────────

/**
 * Get user profile with all details
 */
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const id = userId || user?.id;
    
    if (!id) throw new Error('No user ID');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Create or update user profile
 */
export const upsertUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .upsert([{
        id: user.id,
        email: user.email,
        ...profile,
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    return null;
  }
};

/**
 * Update user profile fields
 */
export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
      })
      .eq('id', user.id);

    return !error;
  } catch (error) {
    return false;
  }
};

/**
 * Update onboarding state
 */
export const updateOnboardingState = async (
  onboardingStep: number,
  completionPercent: number,
  personalityProgress?: number
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { error } = await supabase
      .from('users')
      .update({
        onboarding_step: onboardingStep,
        profile_completion_percent: completionPercent,
        ai_profile_completion: personalityProgress,
      })
      .eq('id', user.id);

    return !error;
  } catch (error) {
    return false;
  }
};

/**
 * Complete onboarding
 */
export const completeOnboarding = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        profile_completion_percent: 100,
      })
      .eq('id', user.id);

    return !error;
  } catch (error) {
    return false;
  }
};

// ─── Photo Upload ──────────────────────────────────────────────────────────────

/**
 * Upload photo to Supabase Storage
 */
export const uploadProfilePhoto = async (
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filePath = `${userId}/${timestamp}-${randomStr}.${fileExt}`;

    console.log('Uploading to bucket: dailystack-photos, path:', filePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('dailystack-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('Upload response:', data);

    // Get the actual path from the response
    const actualPath = data.path || filePath;

    // Get public URL using the actual path
    const { data: urlData } = supabase.storage
      .from('dailystack-photos')
      .getPublicUrl(actualPath);

    console.log('Public URL:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Upload photo error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload photo',
    };
  }
};

/**
 * Upload multiple photos
 */
export const uploadProfilePhotos = async (
  files: File[],
  userId: string
): Promise<{ success: boolean; urls?: string[]; error?: string }> => {
  try {
    const urls: string[] = [];

    for (const file of files) {
      const result = await uploadProfilePhoto(file, userId);
      if (result.success && result.url) {
        urls.push(result.url);
      }
    }

    return {
      success: true,
      urls,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload photos',
    };
  }
};

/**
 * Delete photo from storage
 */
export const deleteProfilePhoto = async (url: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const urlParts = url.split('/dailystack-photos/');
    if (urlParts.length < 2) return false;
    
    const filePath = `dating-photos/${urlParts[1]}`;
    
    const { error } = await supabase.storage
      .from('dailystack-photos')
      .remove([filePath]);

    return !error;
  } catch (error) {
    return false;
  }
};

// ─── Progressive Profiling ─────────────────────────────────────────────────────

/**
 * Get progressive profiling questions
 * Returns questions based on user's current completion level
 */
export const getProgressiveQuestions = async (): Promise<string[]> => {
  try {
    const profile = await getUserProfile();
    
    if (!profile) return [];

    // Return questions based on completion percentage
    const questions: Record<number, string[]> = {
      0: [
        "What's your typical wake-up time?",
        "Do you prefer coffee shops or working from home?",
      ],
      25: [
        "What's your ideal weekend activity?",
        "How do you handle stress?",
      ],
      50: [
        "What topics make for great conversations?",
        "How do you show appreciation to people you care about?",
      ],
      75: [
        "What are your relationship goals?",
        "What's your definition of a meaningful connection?",
      ],
    };

    // Get the closest lower threshold
    const thresholds = Object.keys(questions).map(Number).sort((a, b) => b - a);
    const threshold = thresholds.find(t => (profile.profile_completion_percent ?? 0) >= t) || 0;
    
    return questions[threshold] || [];
  } catch (error) {
    return [];
  }
};

/**
 * Submit progressive profiling answer
 */
export const submitProgressiveAnswer = async (
  questionId: string,
  answer: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { error } = await supabase
      .from('user_progressive_answers')
      .upsert([{
        user_id: user.id,
        question_id: questionId,
        answer,
        created_at: new Date().toISOString(),
      }]);

    return !error;
  } catch (error) {
    return false;
  }
};

// ─── Device Session Management ────────────────────────────────────────────────

/**
 * Get active sessions for user
 */
export const getActiveSessions = async (): Promise<Session[]> => {
  try {
    const session = await getCurrentSession();
    return session ? [session] : [];
  } catch (error) {
    return [];
  }
};

/**
 * Revoke all other sessions except current
 */
export const revokeOtherSessions = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    return !error;
  } catch (error) {
    return false;
  }
};

// ─── Welcome Back Experience ──────────────────────────────────────────────────

/**
 * Get welcome back data for returning user
 */
export const getWelcomeBackData = async (): Promise<{
  name: string;
  hasNewMatches: boolean;
  hasCompatibilityUpdates: boolean;
  hasNewMessages: boolean;
} | null> => {
  try {
    const profile = await getUserProfile();
    
    if (!profile) return null;

    // Check for new matches
    const { count: newMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user1_id', profile.id)
      .eq('has_conversation', false);

    // Check for unread messages
    const { count: unreadMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', profile.id)
      .is('read_at', null);

    return {
      name: profile.display_name || profile.nickname || profile.email?.split('@')[0] || 'User',
      hasNewMatches: (newMatches || 0) > 0,
      hasCompatibilityUpdates: false, // TODO: implement when compatibility system is ready
      hasNewMessages: (unreadMessages || 0) > 0,
    };
  } catch (error) {
    return null;
  }
};

// ─── Auth Log Service ──────────────────────────────────────────────────────────

export const AuthLogService = {
  /**
   * Log authentication event
   */
  async logAuthEvent(loginMethod: string, deviceInfo?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('auth_logs')
      .insert({
        user_id: user.id,
        login_method: loginMethod,
        device_info: deviceInfo || navigator.userAgent,
        login_at: new Date().toISOString(),
      });
  },

  /**
   * Get auth logs for current user
   */
  async getAuthLogs(): Promise<AuthLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('auth_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('login_at', { ascending: false })
      .limit(10);

    return data || [];
  },
};

// ─── Default Export ─────────────────────────────────────────────────────────────

export const AuthService = {
  // Auth methods - Email OTP Sign Up
  signUpWithEmail,
  verifySignUpOtp,
  
  // Auth methods - Email Password Sign In
  signInWithEmail,
  forgotPassword,
  resetPassword,
  
  // Auth methods - Social (Disabled)
  signInWithGoogle,
  signInWithApple,
  handleGoogleCallback,
  
  // Auth methods - OTP (Login/General)
  sendEmailOtp,
  verifyEmailOtp,
  detectAuthFlow,
  
  // Session management
  getCurrentSession,
  getCurrentUser,
  isAuthenticated,
  autoLogin,
  refreshSession,
  signOut,
  
  // Profile management
  getUserProfile,
  upsertUserProfile,
  updateUserProfile,
  updateOnboardingState,
  completeOnboarding,
  
  // Photo upload
  uploadProfilePhoto,
  uploadProfilePhotos,
  deleteProfilePhoto,
  
  // Progressive profiling
  getProgressiveQuestions,
  submitProgressiveAnswer,
  
  // Device management
  getActiveSessions,
  revokeOtherSessions,
  
  // Welcome back
  getWelcomeBackData,
};

export default AuthService;