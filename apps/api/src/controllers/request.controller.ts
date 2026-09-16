import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { z } from 'zod';

const createRequestSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(['food', 'medicine', 'shelter', 'clothes', 'tutoring', 'transport', 'other']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  location_text: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const createRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parseResult = createRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { data, error } = await supabaseAdmin
      .from('requests')
      .insert({
        requester_id: userId,
        ...parseResult.data
      })
      .select()
      .single();

    if (error) {
      console.error('Request creation error:', error);
      return res.status(500).json({ error: 'Failed to create request' });
    }

    // Auto-create an initial timeline entry
    await supabaseAdmin.from('request_timeline').insert({
      request_id: data.id,
      status: 'open',
      note: 'Request created'
    });

    res.status(201).json({ data });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const { status, urgency, category, lat, lng } = req.query;

    let query = supabaseAdmin.from('requests').select(`
      *,
      requester:profiles(id, name, location_text)
    `);

    if (status) query = query.eq('status', status);
    else query = query.eq('status', 'open'); // default to open

    if (urgency) query = query.eq('urgency', urgency);
    if (category) query = query.eq('category', category);

    // If lat and lng are provided, order by distance (this uses PostGIS on the backend if configured, 
    // or we can sort in-memory. For MVP, we will sort here if not using an RPC).
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get requests error:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
