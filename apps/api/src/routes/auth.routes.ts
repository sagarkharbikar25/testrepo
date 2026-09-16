import { Router } from 'express';
import { createProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Ensure the user is authenticated via Supabase JWT before creating profile
router.post('/profile', authMiddleware, createProfile);

export default router;
