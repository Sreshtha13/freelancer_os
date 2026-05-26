import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { getStats } from '../controllers/dashboard.controller.js';

export const profileRouter = Router();

profileRouter.use(authMiddleware);
profileRouter.get('/', getProfile);
profileRouter.patch('/', updateProfile);
profileRouter.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await getStats(req.user.id);
    res.json({ stats });
  } catch (e) {
    next(e);
  }
});
