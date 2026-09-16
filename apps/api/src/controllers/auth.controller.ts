import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2),
  role: z.enum(['requester', 'volunteer', 'ngo_admin']),
  location_text: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  org_name: z.string().optional()
});

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parseResult = profileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        ...parseResult.data
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      return res.status(500).json({ error: 'Failed to create profile' });
    }

    res.status(201).json({ data });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
