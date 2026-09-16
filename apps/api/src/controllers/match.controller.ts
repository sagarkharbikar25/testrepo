import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { z } from 'zod';

export const acceptRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: requestId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Race condition guard via UNIQUE constraint on matches(request_id)
    const { data: matchData, error: matchError } = await supabaseAdmin
      .from('matches')
      .insert({
        request_id: requestId,
        volunteer_id: userId
      })
      .select()
      .single();

    if (matchError) {
      if (matchError.code === '23505') {
        return res.status(409).json({ error: 'Request has already been accepted by another volunteer', code: 'CONFLICT' });
      }
      return res.status(500).json({ error: 'Failed to accept request' });
    }

    // Update request status to 'accepted'
    await supabaseAdmin
      .from('requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    // Add to timeline
    await supabaseAdmin.from('request_timeline').insert({
      request_id: requestId,
      status: 'accepted',
      note: 'Volunteer accepted the request'
    });

    res.status(201).json({ data: matchData });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const statusSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'cancelled'])
});

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: requestId } = req.params;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parseResult = statusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const newStatus = parseResult.data.status;

    // Verify volunteer owns this match (or is requester canceling)
    const { data: match } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (!match || match.volunteer_id !== userId) {
      // Check if it's the requester doing it
      const { data: request } = await supabaseAdmin
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (!request || request.requester_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Update status
    await supabaseAdmin
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    // Add to timeline
    await supabaseAdmin.from('request_timeline').insert({
      request_id: requestId,
      status: newStatus,
      note: `Status updated to ${newStatus}`
    });

    res.status(200).json({ status: newStatus });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
