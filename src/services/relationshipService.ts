/**
 * DailyStack — Relationship Service
 * People & interaction tracking
 */
import { supabase } from '../app/services/supabaseClient';

export type RelationshipType = 'family' | 'partner' | 'friend' | 'colleague' | 'mentor' | 'other';
export type CallFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
export type InteractionType = 'call' | 'meet' | 'text' | 'gift' | 'other';

export interface Relationship {
  id?: string;
  user_id: string;
  name: string;
  relationship_type: RelationshipType;
  call_frequency?: CallFrequency;
  last_interaction?: string | null;
  notes?: string | null;
  is_active?: boolean;
  avatar_url?: string | null;
  created_at?: string;
}

export interface RelationshipLog {
  id?: string;
  relationship_id: string;
  interaction_type: InteractionType;
  interaction_date?: string;
  notes?: string | null;
  created_at?: string;
}

export const RelationshipService = {
  /* ---------- Relationships ---------- */

  /** Create a new relationship */
  async create(data: Omit<Relationship, 'id' | 'user_id' | 'created_at'>): Promise<Relationship | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: row, error } = await supabase
      .from('relationships')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (error) { console.error('RelationshipService.create error:', error); return null; }
    return row;
  },

  /** Get all active relationships */
  async getAll(): Promise<Relationship[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name');

    if (error) { console.error('RelationshipService.getAll error:', error); return []; }
    return data || [];
  },

  /** Get relationship by ID */
  async getById(id: string): Promise<Relationship | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('RelationshipService.getById error:', error);
    }
    return data || null;
  },

  /** Update relationship */
  async update(id: string, updates: Partial<Relationship>): Promise<boolean> {
    const { error } = await supabase
      .from('relationships')
      .update(updates)
      .eq('id', id);
    if (error) { console.error('RelationshipService.update error:', error); return false; }
    return true;
  },

  /** Soft-delete relationship */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('relationships')
      .update({ is_active: false })
      .eq('id', id);
    if (error) { console.error('RelationshipService.delete error:', error); return false; }
    return true;
  },

  /** Get relationships that need attention (past due by frequency) */
  async getNeedsAttention(): Promise<Relationship[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const relationships = await this.getAll();
    const now = new Date();
    const result: Relationship[] = [];

    for (const rel of relationships) {
      if (!rel.last_interaction || !rel.call_frequency) continue;
      const last = new Date(rel.last_interaction);
      const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      const threshold = frequencyDaysMap[rel.call_frequency] || 30;
      if (daysSince >= threshold) {
        result.push({ ...rel });
      }
    }
    return result;
  },

  /* ---------- Relationship Logs ---------- */

  /** Log an interaction with a relationship */
  async logInteraction(
    relationshipId: string,
    type: InteractionType,
    date?: string,
    notes?: string
  ): Promise<RelationshipLog | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Verify ownership
    const rel = await this.getById(relationshipId);
    if (!rel) return null;

    const interactionDate = date || new Date().toISOString().split('T')[0];
    const { data: log, error } = await supabase
      .from('relationship_logs')
      .insert({
        relationship_id: relationshipId,
        interaction_type: type,
        interaction_date: interactionDate,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) { console.error('RelationshipService.logInteraction error:', error); return null; }

    // Update last_interaction on the relationship
    await this.update(relationshipId, { last_interaction: interactionDate });

    return log;
  },

  /** Get interaction history for a relationship */
  async getInteractionHistory(relationshipId: string): Promise<RelationshipLog[]> {
    const { data, error } = await supabase
      .from('relationship_logs')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('interaction_date', { ascending: false })
      .limit(20);

    if (error) { console.error('RelationshipService.getInteractionHistory error:', error); return []; }
    return data || [];
  },

  /** Delete interaction log */
  async deleteInteractionLog(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('relationship_logs')
      .delete()
      .eq('id', id);
    return !error;
  },
};

const frequencyDaysMap: Record<CallFrequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};
