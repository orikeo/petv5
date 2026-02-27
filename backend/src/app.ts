import express from 'express';
import { notesRouter } from './modules/notes/notes.router';
import { weightRouter } from './modules/weight/weight.router';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './modules/auth/auth.router';
import cookieParser from 'cookie-parser';
export const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/auth', authRouter);
app.use('/notes', notesRouter);
app.use('/weights', weightRouter);

// ⬇️ ВСЕГДА в самом конце
app.use(errorMiddleware);