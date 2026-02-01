import express from 'express';
import { notesRouter } from './modules/notes/notes.router';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

app.use(express.json());

app.use('/notes', notesRouter);

// ⬇️ ВСЕГДА в самом конце
app.use(errorMiddleware);