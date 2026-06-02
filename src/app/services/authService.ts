// Import ตัวเชื่อมต่อหลักจาก Single Source of Truth
import { supabase, getSupabaseCredentials } from './supabaseClient';

// Export ตัว supabase ออกไปให้หน้าอื่นๆ ใช้งานต่อได้โดยไม่ต้องแก้ Path
export { supabase };

// ─── Data Access Object (DAO) สำหรับส่วน Auth/Profile ───
export interface OnboardingPreferences {
  discovery_intents?: string[];
  preferred_pace?: string;
  preferred_area?: string;
  notifications_enabled?: boolean;
  completed_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  nickname: string;
  email?: string;
  bio?: string;
  birthdate?: string;
  gender?: string;
  interested_in?: string;
  interest_tags?: string[];
  photos?: string[];
  lifestyle_preferences?: Record<string, unknown>;
  onboarding_preferences?: OnboardingPreferences;
  onboarding_completed_at?: string | null;
  notifications_enabled?: boolean;
  last_login_at?: string | null;
  profile_status?: string;
  profile_completion_score?: number;
  display_name?: string;
  updated_at?: string;
}

export type AuthIntent = 'signup' | 'login';

const DEFAULT_NICKNAME = 'DailyStack Member';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeNickname = (nickname?: string | null) => (nickname?.trim() ? nickname.trim() : '');
const normalizeArray = (items?: string[]) => (Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string') : []);

export const calculateProfileCompletionScore = (profile: {
  nickname?: string;
  bio?: string;
  birthdate?: string;
  interested_in?: string;
  interest_tags?: string[];
  photos?: string[];
}) => {
  const nicknameScore = profile.nickname?.trim() ? 15 : 0;
  const bioScore = profile.bio?.trim() ? 15 : 0;
  const birthdateScore = profile.birthdate ? 10 : 0;
  const interestScore = profile.interest_tags?.length ? Math.min(profile.interest_tags.length, 5) * 4 : 0;
  const interestBonus = (profile.interest_tags?.length ?? 0) >= 3 ? 5 : 0;
  const photoScore = profile.photos?.length ? 20 : 0;
  const interestedInScore = profile.interested_in ? 10 : 0;

  return Math.min(
    100,
    10 + nicknameScore + bioScore + birthdateScore + interestScore + interestBonus + photoScore + interestedInScore,
  );
};

const isMissingColumnError = (error: { message?: string } | null) => {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes('column') || message.includes('schema cache');
};

export const ensureUserProfile = async (
  userId: string,
  email: string,
  nickname?: string | null,
): Promise<UserProfile> => {
  const cleanEmail = normalizeEmail(email);
  const requestedNickname = normalizeNickname(nickname);
  const existingProfile = await getProfile(userId);
  const resolvedNickname = requestedNickname || existingProfile?.nickname || DEFAULT_NICKNAME;
  const now = new Date().toISOString();

  const upsertPayload = {
    user_id: userId,
    email: cleanEmail,
    nickname: resolvedNickname,
    last_login_at: now,
    profile_status: existingProfile?.profile_status || 'active',
    updated_at: now,
  };

  const { error } = await supabase
    .from('user_profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' });

  if (!error) {
    const profile = await getProfile(userId);
    if (profile) return profile;
  }

  if (!isMissingColumnError(error)) {
    throw error;
  }

  const { error: fallbackError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        nickname: resolvedNickname,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    );

  if (fallbackError) throw fallbackError;

  const profile = await getProfile(userId);
  if (!profile) {
    throw new Error('Unable to load user profile after upsert.');
  }

  return profile;
};

export const upsertSignupProfile = async (
  userId: string,
  email: string,
  nickname: string,
): Promise<void> => {
  await ensureUserProfile(userId, email, nickname);
};

export const getPostAuthRedirect = (profile: UserProfile | null): '/onboarding' | '/dashboard' => {
  if (!profile?.onboarding_completed_at) return '/onboarding';
  return '/dashboard';
};

export const saveOnboardingProfile = async (
  userId: string,
  nickname: string,
  interestTags: string[],
  lifestylePreferences: Record<string, unknown>,
  photoUrl?: string,
): Promise<void> => {
  const now = new Date().toISOString();
  const normalizedInterests = normalizeArray(interestTags);
  const completionScore = calculateProfileCompletionScore({
    nickname,
    interest_tags: normalizedInterests,
    photos: photoUrl ? [photoUrl] : [],
    interested_in: lifestylePreferences?.preferred_area ? 'everyone' : undefined,
  });

  const payload: Record<string, unknown> = {
    user_id: userId,
    nickname: nickname.trim() || DEFAULT_NICKNAME,
    interest_tags: normalizedInterests,
    lifestyle_preferences: lifestylePreferences,
    onboarding_preferences: lifestylePreferences as { [key: string]: unknown },
    onboarding_completed_at: now,
    profile_completion_score: completionScore,
    profile_status: 'onboarded',
    updated_at: now,
  };

  if (photoUrl) {
    payload.photos = [photoUrl];
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (!error) return;

  if (!isMissingColumnError(error)) {
    throw error;
  }

  const fallbackPayload: Record<string, unknown> = {
    user_id: userId,
    nickname: nickname.trim() || DEFAULT_NICKNAME,
    interest_tags: normalizedInterests,
    updated_at: now,
  };

  if (photoUrl) {
    fallbackPayload.photos = [photoUrl];
  }

  const { error: fallbackError } = await supabase
    .from('user_profiles')
    .upsert(fallbackPayload, { onConflict: 'user_id' });

  if (fallbackError) throw fallbackError;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<UserProfile, 'nickname' | 'interest_tags' | 'lifestyle_preferences' | 'photos' | 'notifications_enabled'>>,
): Promise<void> => {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    user_id: userId,
    updated_at: now,
  };

  if (updates.nickname !== undefined) {
    payload.nickname = normalizeNickname(updates.nickname);
  }
  if (updates.interest_tags !== undefined) {
    payload.interest_tags = normalizeArray(updates.interest_tags);
  }
  if (updates.lifestyle_preferences !== undefined) {
    payload.lifestyle_preferences = updates.lifestyle_preferences;
  }
  if (updates.photos !== undefined) {
    payload.photos = updates.photos;
  }
  if (updates.notifications_enabled !== undefined) {
    payload.notifications_enabled = updates.notifications_enabled;
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (!error) return;
  if (!isMissingColumnError(error)) {
    throw error;
  }

  const fallbackPayload: Record<string, unknown> = {
    user_id: userId,
    updated_at: now,
  };
  if (updates.nickname !== undefined) {
    fallbackPayload.nickname = normalizeNickname(updates.nickname);
  }
  if (updates.interest_tags !== undefined) {
    fallbackPayload.interest_tags = normalizeArray(updates.interest_tags);
  }
  if (updates.photos !== undefined) {
    fallbackPayload.photos = updates.photos;
  }

  const { error: fallbackError } = await supabase
    .from('user_profiles')
    .upsert(fallbackPayload, { onConflict: 'user_id' });

  if (fallbackError) throw fallbackError;
};

export const uploadProfilePhoto = async (userId: string, file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const fileName = `profile_${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError || !data) {
      console.error('[authService] uploadProfilePhoto failed:', uploadError);
      return null;
    }

    const { data: publicUrlData } = await supabase
      .storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl || null;
  } catch (error) {
    console.error('[authService] uploadProfilePhoto exception:', error);
    return null;
  }
};

// แยก Logic การดึงข้อมูลออกจาก UI Components (Best Practice)
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Wrapper around Supabase OTP signin to add robust diagnostics for network/auth issues.
export async function sendOtp(
  email: string,
  options?: { shouldCreateUser?: boolean; data?: Record<string, unknown> },
) {
  const creds = getSupabaseCredentials();
  if (!creds.url || !creds.anonKey) {
    throw new Error('Missing Supabase credentials. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  try {
    // Log request-level diagnostics to help debug 'Failed to fetch' issues.
    // Do NOT log sensitive secrets in production — this is only for dev/test debugging.
    console.debug('[sendOtp] Supabase URL:', creds.url);
    console.debug('[sendOtp] Using placeholder creds:', creds.usingPlaceholder);

    // Construct the REST endpoint the client will call so we can see the exact URL.
    const authEndpoint = (creds.url || '').replace(/\/$/, '') + '/auth/v1/otp';
    console.debug('[sendOtp] Expected auth REST endpoint:', authEndpoint);

    // Log the headers that the Supabase client will include for the request.
    // We avoid printing the full anonKey but show whether it's present.
    console.debug('[sendOtp] Headers: { apikey: <present?>', !!creds.anonKey, ', Authorization: Bearer <present?>', !!creds.anonKey, '}');

    const res = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: options?.shouldCreateUser ?? false,
        data: options?.data,
      },
    });

    console.debug('[sendOtp] Supabase SDK response', JSON.stringify(res));
    return res;
  } catch (error) {
    // Provide a rich error log to the console to capture network layer failures.
    console.error('[sendOtp] Error calling supabase.auth.signInWithOtp', {
      message: (error as Error).message ?? String(error),
      stack: (error as Error).stack ?? null,
      supabaseUrl: creds.url,
      hasAnonKey: !!creds.anonKey,
    });
    throw error;
  }
}
