import { Router } from 'express';
import { acceptRequest, updateStatus } from '../controllers/match.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Volunteer accepts a request
router.post('/:id/accept', authMiddleware, acceptRequest);
// Update status of a request (In Progress, Completed)
router.patch('/:id/status', authMiddleware, updateStatus);

export default router;
