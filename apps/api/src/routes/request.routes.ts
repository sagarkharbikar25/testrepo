import { Router } from 'express';
import { createRequest, getRequests } from '../controllers/request.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createRequest);
router.get('/', authMiddleware, getRequests);

export default router;
