import { Router } from 'express';
import { TeamsController } from '@/controllers/teams-controller.js';
import { verifyAuthentication } from '@/middlewares/verify-authentication.js';
import { verifyAuthorization } from '@/middlewares/verify-authorization.js';

const teamsRoutes = Router();
const teamsController = new TeamsController();

teamsRoutes.post('/', verifyAuthentication, verifyAuthorization(['admin']), teamsController.create);

export { teamsRoutes };
