import { app } from './app';
import './types/express';
import 'dotenv/config';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log('NODE NOW:', new Date());
});