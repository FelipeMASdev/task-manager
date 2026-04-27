import { Router } from 'express';
import { usersRoutes } from './users-routes.js';
import { teamsRoutes } from './teams-routes.js';
import { teamMembersRoutes } from './team-members-routes.js';
import { tasksRoutes } from './tasks-routes.js';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/teams', teamsRoutes);
routes.use('/teams/:teamID/members', teamMembersRoutes);
routes.use('/teams/:teamID/tasks', tasksRoutes);

export { routes };
