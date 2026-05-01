import { Router } from 'express';
import { UsersController } from '@/controllers/users-controller.js';
import { verifyAuthentication } from '@/middlewares/verify-authentication.js';
import { verifyAuthorization } from '@/middlewares/verify-authorization.js';

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post('/', usersController.create);

usersRoutes.post('/login', usersController.login);

usersRoutes.patch(
  '/:userID/add-admin',
  verifyAuthentication,
  verifyAuthorization(['admin']),
  usersController.addAdmin,
);

export { usersRoutes };
