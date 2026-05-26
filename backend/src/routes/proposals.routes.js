import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateProposalSchema } from '../schemas/proposals.schema.js';
import * as proposalsController from '../controllers/proposals.controller.js';

export const proposalsRouter = Router();

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

proposalsRouter.use(authMiddleware);
proposalsRouter.get('/', proposalsController.list);
proposalsRouter.post(
  '/generate',
  aiLimiter,
  validate(generateProposalSchema),
  proposalsController.generate
);
