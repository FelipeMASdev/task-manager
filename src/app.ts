import express from 'express';
import { routes } from './routes/index.js';
import { errorHandling } from './middlewares/error-handling.js';

const app = express();

app.use(express.json());

app.use(routes);
app.use(errorHandling);

export { app };
