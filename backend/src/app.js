import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { jobsRouter } from './routes/jobs.routes.js';
import { applicationsRouter } from './routes/applications.routes.js';
import { proposalsRouter } from './routes/proposals.routes.js';
import { clientsRouter } from './routes/clients.routes.js';
import { projectsRouter } from './routes/projects.routes.js';
import { invoicesRouter } from './routes/invoices.routes.js';
import { billingRouter } from './routes/billing.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

app.use('/health', healthRouter);
app.use('/api/profile', profileRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/billing', billingRouter);

app.use(errorHandler);

export default app;
