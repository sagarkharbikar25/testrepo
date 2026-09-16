import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token', code: 'UNAUTHORIZED' });
    }

    // Get user profile to attach role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found', code: 'UNAUTHORIZED' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: profile.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};
