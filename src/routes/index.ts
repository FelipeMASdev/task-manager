import { Router } from 'express';
import { usersRoutes } from './users-routes.js';
import { teamsRoutes } from './teams-routes.js';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/teams', teamsRoutes);

export { routes };
