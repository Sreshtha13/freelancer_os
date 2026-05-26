import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as applicationsController from '../controllers/applications.controller.js';

export const applicationsRouter = Router();

applicationsRouter.use(authMiddleware);
applicationsRouter.get('/', applicationsController.list);
applicationsRouter.post('/', applicationsController.create);
applicationsRouter.patch('/:id', applicationsController.update);
