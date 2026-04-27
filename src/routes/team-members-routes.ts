import { Router } from 'express';
import { TeamMembersController } from '@/controllers/team-members-controller.js';
import { verifyAuthentication } from '@/middlewares/verify-authentication.js';
import { verifyAuthorization } from '@/middlewares/verify-authorization.js';

const teamMembersRoutes = Router({ mergeParams: true });
const teamMembersController = new TeamMembersController();

teamMembersRoutes.post(
  '/',
  verifyAuthentication,
  verifyAuthorization(['admin']),
  teamMembersController.create,
);
teamMembersRoutes.get(
  '/',
  verifyAuthentication,
  verifyAuthorization(['admin', 'member']),
  teamMembersController.list,
);
teamMembersRoutes.delete(
  '/:userID',
  verifyAuthentication,
  verifyAuthorization(['admin']),
  teamMembersController.delete,
);

export { teamMembersRoutes };
