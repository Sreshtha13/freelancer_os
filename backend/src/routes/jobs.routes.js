import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { importJobSchema, listJobsSchema } from '../schemas/jobs.schema.js';
import * as jobsController from '../controllers/jobs.controller.js';

export const jobsRouter = Router();

const syncLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

jobsRouter.use(authMiddleware);
jobsRouter.get('/', validate(listJobsSchema), jobsController.listJobs);
jobsRouter.get('/:id', jobsController.getJob);
jobsRouter.post('/sync', syncLimiter, jobsController.syncJobs);
jobsRouter.post('/import', validate(importJobSchema), jobsController.importJob);
