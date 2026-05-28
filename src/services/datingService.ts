/**
 * DailyStack — Dating Service (v2.1)
 * Backend integration for all dating features
 * 
 * Based on: install-all.sql Schema V2.1
 * Architecture: Single Source of Truth, Soft Deletes, Optimized Matching
 */

import { supabase } from '../app/services/supabaseClient';

// =====================================================
// TYPES (Mapped to DB Schema)
// =====================================================

export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
  compatibility: number;
  lifestyleScore: number;
  personalityScore: number;
  insights: string[];
  interests: string[];
  bio: string;
  relationshipGoal: string;
  occupation?: string;
  education?: string;
  mbti?: string;
  sleepSchedule?: string;
  workStyle?: string;
  socialEnergy?: string;
  isUltraMatch?: boolean;
  online?: boolean;
  distance?: number;
  gender?: string;
}

export interface Match {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  compatibilityScore: number;
  isUltraMatch: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  hasConversation: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'icebreaker' | 'system' | 'image';
  readAt?: Date;
  createdAt: Date;
}

export interface MatchLimits {
  curated: { remaining: number; max: number };
  explore: { remaining: number; max: number };
  resetAt: Date;
}

export interface DiscoveryProfile {
  overallScore: number;
  lifestyleScore: number;
  personalityScore: number;
  distanceKm: number;
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredGenders: string[];
  totalLikesReceived: number;
  totalMatches: number;
  profileViews: number;
}

// =====================================================
// USER PROFILE SERVICE
// =====================================================

export const DatingProfileService = {
  /**
   * Get current user's profile from users table
   */
  async getMyProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.display_name || data.nickname || 'Anonymous',
      age: data.age || 25,
      location: data.location || 'Bangkok',
      photos: data.dating_photos || [],
      compatibility: 0,
      lifestyleScore: 0,
      personalityScore: 0,
      insights: [],
      interests: data.interests || [],
      bio: data.bio || '',
      relationshipGoal: data.relationship_goals || '',
      occupation: data.occupation,
      education: data.education,
      mbti: data.mbti,
      sleepSchedule: data.sleep_schedule,
      workStyle: data.work_style,
      socialEnergy: data.social_energy,
      gender: data.gender,
    };
  },

  /**
   * Update dating profile in users table
   */
  async updateProfile(updates: Partial<Profile>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Map frontend field names to DB column names
    const dbUpdates: Record<string, any> = {};
    
    if (updates.name !== undefined) dbUpdates.display_name = updates.name;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.relationshipGoal !== undefined) dbUpdates.relationship_goals = updates.relationshipGoal;
    if (updates.photos !== undefined) dbUpdates.dating_photos = updates.photos;
    if (updates.occupation !== undefined) dbUpdates.occupation = updates.occupation;
    if (updates.education !== undefined) dbUpdates.education = updates.education;
    if (updates.mbti !== undefined) dbUpdates.mbti = updates.mbti;
    if (updates.sleepSchedule !== undefined) dbUpdates.sleep_schedule = updates.sleepSchedule;
    if (updates.workStyle !== undefined) dbUpdates.work_style = updates.workStyle;
    if (updates.socialEnergy !== undefined) dbUpdates.social_energy = updates.socialEnergy;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;

    if (Object.keys(dbUpdates).length === 0) return true;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', user.id);

    return !error;
  },

  /**
   * Get discovery profile (compatibility scores from discovery_profiles table)
   */
  async getDiscoveryProfile(): Promise<DiscoveryProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('discovery_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      overallScore: data.overall_compatibility_score || 0,
      lifestyleScore: data.lifestyle_score || 0,
      personalityScore: data.personality_score || 0,
      distanceKm: data.discovery_distance_km || 50,
      preferredAgeMin: data.preferred_age_min || 18,
      preferredAgeMax: data.preferred_age_max || 35,
      preferredGenders: data.preferred_genders || [],
      totalLikesReceived: data.total_likes_received || 0,
      totalMatches: data.total_matches || 0,
      profileViews: data.profile_views || 0,
    };
  },

  /**
   * Update discovery preferences
   */
  async updateDiscoveryPreferences(updates: {
    distanceKm?: number;
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    preferredGenders?: string[];
  }): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const dbUpdates: Record<string, any> = {};
    if (updates.distanceKm !== undefined) dbUpdates.discovery_distance_km = updates.distanceKm;
    if (updates.preferredAgeMin !== undefined) dbUpdates.preferred_age_min = updates.preferredAgeMin;
    if (updates.preferredAgeMax !== undefined) dbUpdates.preferred_age_max = updates.preferredAgeMax;
    if (updates.preferredGenders !== undefined) dbUpdates.preferred_genders = updates.preferredGenders;

    if (Object.keys(dbUpdates).length === 0) return true;

    const { error } = await supabase
      .from('discovery_profiles')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    return !error;
  },
};

// =====================================================
// MATCH LIMITS SERVICE
// =====================================================

export const MatchLimitsService = {
  /**
   * Get current user's match limits from user_match_limits table
   */
  async getLimits(): Promise<MatchLimits | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_match_limits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // Return default limits if not found
      return getDefaultLimits();
    }

    return {
      curated: {
        remaining: data.curated_remaining,
        max: 5, // Default max
      },
      explore: {
        remaining: data.explore_remaining,
        max: 10, // Default max
      },
      resetAt: data.reset_at ? new Date(data.reset_at) : getNextDailyReset(),
    };
  },

  /**
   * Check if user has reached any limit
   */
  async checkLimits(): Promise<{
    canCurated: boolean;
    canExplore: boolean;
    reason?: string;
  }> {
    const limits = await this.getLimits();
    if (!limits) {
      return { canCurated: true, canExplore: true };
    }

    // Check curated limit
    if (limits.curated.remaining <= 0) {
      return {
        canCurated: false,
        canExplore: limits.explore.remaining > 0,
        reason: 'Daily curated matches exhausted',
      };
    }

    // Check explore limit
    if (limits.explore.remaining <= 0) {
      return {
        canCurated: limits.curated.remaining > 0,
        canExplore: false,
        reason: 'Daily explore likes exhausted',
      };
    }

    return {
      canCurated: true,
      canExplore: true,
    };
  },

  /**
   * Decrement curated remaining
   */
  async useCurated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_match_limits')
      .update({
        curated_remaining: supabase.rpc('decrement', { row: 'curated_remaining', num: 1 }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return !error;
  },

  /**
   * Decrement explore remaining
   */
  async useExplore(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_match_limits')
      .update({
        explore_remaining: supabase.rpc('decrement', { row: 'explore_remaining', num: 1 }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return !error;
  },
};

// =====================================================
// DISCOVERY SERVICE (Hybrid: Swipe + Smart List)
// =====================================================

export const DiscoveryService = {
  /**
   * Get curated matches (AI-selected, limited per day)
   */
  async getCuratedMatches(): Promise<Profile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get profiles user hasn't seen from swipes table
    const { data: seenIds } = await supabase
      .from('swipes')
      .select('target_user_id')
      .eq('swiper_id', user.id);

    const excludeIds = seenIds?.map(s => s.target_user_id) || [];
    excludeIds.push(user.id); // Exclude self

    // Get top compatible profiles from discovery_profiles with user data
    const { data: profiles, error } = await supabase
      .from('discovery_profiles')
      .select(`
        *,
        user:users!user_id(
          id, display_name, nickname, avatar_url, bio, 
          age, location, gender, dating_photos, interests,
          relationship_goals, occupation, education, mbti
        )
      `)
      .not('user_id', 'in', `(${excludeIds.join(',') || 'NULL'})`)
      .order('overall_compatibility_score', { ascending: false })
      .limit(5);

    if (error || !profiles) return [];

    return profiles.map(p => transformToProfile(p));
  },

  /**
   * Get explore matches (Smart list + Swipe)
   */
  async getExploreMatches(
    options: {
      offset?: number;
      limit?: number;
      interestFilter?: string[];
      ageRange?: { min: number; max: number };
    } = {}
  ): Promise<Profile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { offset = 0, limit = 20 } = options;

    // Get profiles user hasn't seen
    const { data: seenIds } = await supabase
      .from('swipes')
      .select('target_user_id')
      .eq('swiper_id', user.id);

    const excludeIds = seenIds?.map(s => s.target_user_id) || [];
    excludeIds.push(user.id);

    const { data: profiles, error } = await supabase
      .from('discovery_profiles')
      .select(`
        *,
        user:users!user_id(
          id, display_name, nickname, avatar_url, bio,
          age, location, gender, dating_photos, interests
        )
      `)
      .not('user_id', 'in', `(${excludeIds.join(',') || 'NULL'})`)
      .order('overall_compatibility_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !profiles) return [];

    return profiles.map(p => transformToProfile(p));
  },
};

// =====================================================
// SWIPE SERVICE
// =====================================================

export const SwipeService = {
  /**
   * Swipe on a profile (like, pass, superlike)
   * Note: 'action' field in DB, not 'action_type'
   */
  async swipe(
    targetUserId: string,
    action: 'like' | 'pass' | 'superlike'
  ): Promise<{ success: boolean; isMatch?: boolean; matchId?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    // Record the swipe to swipes table
    const { error: swipeError } = await supabase
      .from('swipes')
      .insert({
        swiper_id: user.id,
        target_user_id: targetUserId,
        action: action, // 'like', 'pass', 'superlike' - matches DB schema
        source: 'discovery',
        created_match: false, // Will be updated by trigger
      });

    if (swipeError) {
      console.error('Swipe error:', swipeError);
      return { success: false };
    }

    // Update limits if liked
    if (action === 'like' || action === 'superlike') {
      await MatchLimitsService.useExplore();
    }

    // Check for match (trigger already creates match, we just need to get it)
    if (action === 'like' || action === 'superlike') {
      // Small delay to let trigger complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get match - note user ordering with smaller UUID first
      const match = await this.findMatch(user.id, targetUserId);
      if (match) {
        return { success: true, isMatch: true, matchId: match.id };
      }
    }

    return { success: true, isMatch: false };
  },

  /**
   * Find match between two users
   */
  async findMatch(userId1: string, userId2: string): Promise<{ id: string } | null> {
    // Order IDs to match CHECK constraint (user1_id < user2_id)
    const [u1, u2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .eq('user1_id', u1)
      .eq('user2_id', u2)
      .is('deleted_at', null) // Only active matches
      .single();

    return data || null;
  },
};

// =====================================================
// MATCH SERVICE
// =====================================================

export const MatchService = {
  /**
   * Get all active matches
   */
  async getMatches(): Promise<Match[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:users!user1_id(id, display_name, nickname, avatar_url),
        user2:users!user2_id(id, display_name, nickname, avatar_url),
        messages(content, created_at, sender_id)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .is('deleted_at', null) // Only active matches (soft delete)
      .order('created_at', { ascending: false });

    if (error || !matches) return [];

    return matches.map(m => {
      const partner = m.user1_id === user.id ? m.user2 : m.user1;
      const unreadMessages = m.messages?.filter(
        (msg: any) => msg.sender_id !== user.id
      ) || [];

      return {
        id: m.id,
        partnerId: partner.id,
        partnerName: partner.display_name || partner.nickname || 'Anonymous',
        partnerAvatar: partner.avatar_url || '',
        compatibilityScore: m.compatibility_score || 0,
        isUltraMatch: m.is_ultra_match || false,
        lastMessage: m.messages?.[0]?.content,
        lastMessageTime: m.messages?.[0]?.created_at
          ? new Date(m.messages[0].created_at)
          : undefined,
        unreadCount: unreadMessages.length,
        hasConversation: m.has_conversation || false,
        createdAt: new Date(m.created_at),
      };
    });
  },

  /**
   * Get a single match by ID
   */
  async getMatch(matchId: string): Promise<Match | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:users!user1_id(id, display_name, nickname, avatar_url),
        user2:users!user2_id(id, display_name, nickname, avatar_url)
      `)
      .eq('id', matchId)
      .single();

    if (error || !match) return null;

    const partner = match.user1_id === user.id ? match.user2 : match.user1;

    return {
      id: match.id,
      partnerId: partner.id,
      partnerName: partner.display_name || partner.nickname || 'Anonymous',
      partnerAvatar: partner.avatar_url || '',
      compatibilityScore: match.compatibility_score || 0,
      isUltraMatch: match.is_ultra_match || false,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
      hasConversation: match.has_conversation || false,
      createdAt: new Date(match.created_at),
    };
  },

  /**
   * Unmatch (Soft delete - set deleted_at)
   */
  async unmatch(matchId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('matches')
      .update({
        status: 'unmatched',
        deleted_at: new Date().toISOString(), // Soft delete
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    return !error;
  },
};

// =====================================================
// MESSAGE SERVICE
// =====================================================

export const MessageService = {
  /**
   * Get messages for a match
   */
  async getMessages(matchId: string): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .is('deleted_at', null) // Only non-deleted messages
      .order('created_at', { ascending: true });

    if (error || !messages) return [];

    return messages.map(m => ({
      id: m.id,
      matchId: m.match_id,
      senderId: m.sender_id,
      content: m.content,
      type: m.message_type || 'text',
      readAt: m.read_at ? new Date(m.read_at) : undefined,
      createdAt: new Date(m.created_at),
    }));
  },

  /**
   * Send a message
   */
  async sendMessage(
    matchId: string,
    content: string,
    type: 'text' | 'icebreaker' = 'text'
  ): Promise<Message | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content,
        message_type: type,
      })
      .select()
      .single();

    if (error || !message) return null;

    // Mark conversation as active
    await supabase
      .from('matches')
      .update({
        has_conversation: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    return {
      id: message.id,
      matchId: message.match_id,
      senderId: message.sender_id,
      content: message.content,
      type: message.message_type,
      createdAt: new Date(message.created_at),
    };
  },

  /**
   * Mark messages as read
   */
  async markAsRead(matchId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('match_id', matchId)
      .neq('sender_id', user.id)
      .is('read_at', null);
  },

  /**
   * Subscribe to new messages (real-time)
   */
  subscribeToMessages(
    matchId: string,
    callback: (message: Message) => void
  ): () => void {
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const message = payload.new as any;
          callback({
            id: message.id,
            matchId: message.match_id,
            senderId: message.sender_id,
            content: message.content,
            type: message.message_type,
            createdAt: new Date(message.created_at),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    return !error;
  },
};

// =====================================================
// MEMBERSHIP SERVICE (New from Schema)
// =====================================================

export const MembershipService = {
  /**
   * Get user's membership info
   */
  async getMembership(): Promise<{
    brandName: string;
    cardNumber: string;
    tier: string;
    status: string;
  } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_memberships')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      brandName: data.brand_name,
      cardNumber: data.card_number || '',
      tier: data.tier,
      status: data.status,
    };
  },

  /**
   * Create or update membership
   */
  async upsertMembership(membership: {
    brandName: string;
    cardNumber?: string;
    tier?: string;
  }): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_memberships')
      .upsert({
        user_id: user.id,
        brand_name: membership.brandName,
        card_number: membership.cardNumber,
        tier: membership.tier || 'member',
        status: 'active',
      });

    return !error;
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function transformToProfile(data: any): Profile {
  const userData = data.user || {};
  
  return {
    id: userData.id || data.user_id,
    name: userData.display_name || userData.nickname || 'Anonymous',
    age: userData.age || 25,
    location: userData.location || 'Bangkok',
    photos: userData.dating_photos || (userData.avatar_url ? [userData.avatar_url] : []),
    compatibility: data.overall_compatibility_score || 0,
    lifestyleScore: data.lifestyle_score || 0,
    personalityScore: data.personality_score || 0,
    bio: userData.bio || '',
    relationshipGoal: userData.relationship_goals || '',
    occupation: userData.occupation,
    education: userData.education,
    mbti: userData.mbti,
    sleepSchedule: userData.sleep_schedule,
    workStyle: userData.work_style,
    socialEnergy: userData.social_energy,
    gender: userData.gender,
    interests: userData.interests || [],
    isUltraMatch: data.is_ultra_match || false,
    online: false,
    distance: data.distance_km,
    insights: [],
  };
}

function getDefaultLimits(): MatchLimits {
  return {
    curated: {
      remaining: 5,
      max: 5,
    },
    explore: {
      remaining: 10,
      max: 10,
    },
    resetAt: getNextDailyReset(),
  };
}

function getNextDailyReset(): Date {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(19, 30, 0, 0);
  if (reset < now) reset.setDate(reset.getDate() + 1);
  return reset;
}

// =====================================================
// EXPORTS
// =====================================================

export const DatingService = {
  profile: DatingProfileService,
  limits: MatchLimitsService,
  discovery: DiscoveryService,
  swipe: SwipeService,
  match: MatchService,
  message: MessageService,
  membership: MembershipService,
};

export default DatingService;