import { Router, Response } from 'express';
import { supabase } from '../supabaseClient.js'; // assume client export
import { authGuard } from '../middleware/authGuard.js';
import { AuthenticatedRequest } from '../types/authenticatedRequest.js';

const router = Router();

// GET / - list subscriptions for authenticated user
router.get('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return res.json({ subscriptions: data });
  } catch (err) {
    console.error('[subscriptions] list error', err);
    return res.status(500).json({ error: 'failed_to_fetch' });
  }
});

// POST / - create new subscription
router.post('/', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const payload = { user_id: userId, ...req.body };
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ subscription: data });
  } catch (err) {
    console.error('[subscriptions] create error', err);
    return res.status(500).json({ error: 'failed_to_create' });
  }
});

// PUT /:id - update subscription
router.put('/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return res.json({ subscription: data });
  } catch (err) {
    console.error('[subscriptions] update error', err);
    return res.status(500).json({ error: 'failed_to_update' });
  }
});

// DELETE /:id - delete subscription
router.delete('/:id', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return res.status(204).send();
  } catch (err) {
    console.error('[subscriptions] delete error', err);
    return res.status(500).json({ error: 'failed_to_delete' });
  }
});

export default router;
