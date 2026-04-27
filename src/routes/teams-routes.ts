import { Router } from 'express';
import { TeamsController } from '@/controllers/teams-controller.js';
import { verifyAuthentication } from '@/middlewares/verify-authentication.js';
import { verifyAuthorization } from '@/middlewares/verify-authorization.js';

const teamsRoutes = Router();
const teamsController = new TeamsController();

teamsRoutes.post('/', verifyAuthentication, verifyAuthorization(['admin']), teamsController.create);
teamsRoutes.get('/', verifyAuthentication, verifyAuthorization(['admin']), teamsController.list);
teamsRoutes.patch(
  '/:id',
  verifyAuthentication,
  verifyAuthorization(['admin']),
  teamsController.update,
);
teamsRoutes.delete(
  '/:id',
  verifyAuthentication,
  verifyAuthorization(['admin']),
  teamsController.delete,
);

export { teamsRoutes };
