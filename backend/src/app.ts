import express from 'express';
import { notesRouter } from './modules/notes/notes.router';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './modules/auth/auth.router';

export const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/notes', notesRouter);

// ⬇️ ВСЕГДА в самом конце
app.use(errorMiddleware);