import express from 'express';
import { notesRouter } from './modules/notes/notes.router';

export const app = express();

app.use(express.json());
app.use('/notes', notesRouter);