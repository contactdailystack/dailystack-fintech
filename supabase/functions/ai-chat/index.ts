// ============================================================
// DailyStack AI Coach - Supabase Edge Function
// Model: MiniMax Text-01 (fast, affordable, Thai-capable)
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    // --- Tier check ---
    const { data: profile } = await supabaseClient
      .from('users')
      .select('subscription_tier, display_name')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'basic'
    if (!['pro', 'elite'].includes(tier)) {
      return json({
        error: 'upgrade_required',
        message: 'AI Coach is available on PRO and ELITE plans.',
      }, 403)
    }

    // --- Parse body ---
    const { prompt, archetype, sessionId, lang } = await req.json()
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return json({ error: 'Empty prompt' }, 400)
    }

    // --- Fetch FBIS score ---
    let fbisScore = 50
    try {
      const { data: fp } = await supabaseClient
        .from('user_financial_profiles')
        .select('current_fbis_score')
        .eq('user_id', user.id)
        .single()
      if (fp?.current_fbis_score) fbisScore = fp.current_fbis_score
    } catch { /* non-critical */ }

    // --- Build conversation history ---
    let history: Array<{ role: 'user' | 'model'; text: string }> = []
    try {
      const { data: rows } = await supabaseClient
        .from('ai_coach_conversations')
        .select('message_role, message_content')
        .eq('user_id', user.id)
        .eq('session_id', sessionId || 'default')
        .order('created_at', { ascending: true })
        .limit(10)
      if (rows) {
        history = rows.map(r => ({
          role: r.message_role === 'user' ? 'user' : 'model',
          text: r.message_content,
        }))
      }
    } catch { /* non-critical */ }

    // --- Build system prompt ---
    const displayName = profile?.display_name || 'there'
    const userLang = lang || 'en'
    const systemPrompt = `You are K.Nonthawat (นนท์), DailyStack's AI Financial Coach.
You are a calm, wise, Thai financial advisor with deep knowledge of Thai spending culture.
Your personality: warm but precise, never judgmental, always practical.
Speak in the user's language (${userLang === 'th' ? 'Thai' : 'English'}).

Rules:
1. NEVER give specific stock/investment advice (regulatory risk)
2. Focus on: budget psychology, spending awareness, savings habits, financial mindset
3. Use Thai cultural examples when appropriate (Songkran, Loy Krathong, payday cycles)
4. Keep responses concise: 2-4 sentences for quick advice, 1 paragraph for deep insights
5. End with a gentle, specific action question

User context:
- Spending archetype: ${archetype || 'balanced'}
- FBIS score: ${fbisScore}/100
- Plan: ${tier.toUpperCase()}`

    // --- Build messages for MiniMax ---
    const messages = [
      { role: 'system', text: systemPrompt },
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        text: `${h.role === 'user' ? displayName + ': ' : 'Coach: '}${h.text}`,
      })),
      { role: 'user', text: `${displayName}: ${prompt}` },
    ]

    // --- Call MiniMax API ---
    const minimaxKey = Deno.env.get('MINIMAX_API_KEY')
    if (!minimaxKey) {
      return json({ error: 'AI service not configured' }, 503)
    }

    const minimaxRes = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${minimaxKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: messages.map(m => ({ role: m.role, text: m.text })),
        max_tokens: 500,
        temperature: 0.8,
      }),
    })

    if (!minimaxRes.ok) {
      const err = await minimaxRes.text()
      console.error('MiniMax API error:', err)
      return json({ error: 'AI service temporarily unavailable' }, 502)
    }

    const data = await minimaxRes.json()
    const reply = data?.choices?.[0]?.text || data?.choices?.[0]?.message?.text

    if (!reply) {
      return json({ error: 'Empty response from AI' }, 502)
    }

    // --- Persist conversation ---
    const sid = sessionId || 'default'
    try {
      await supabaseClient.from('ai_coach_conversations').insert([
        { user_id: user.id, session_id: sid, message_role: 'user', message_content: prompt.trim(), archetype, fbis_score: fbisScore },
        { user_id: user.id, session_id: sid, message_role: 'coach', message_content: reply, archetype, fbis_score: fbisScore },
      ])
    } catch (e) {
      console.error('Persist error:', e)
    }

    return json({ reply })

  } catch (error) {
    console.error('AI Coach error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
