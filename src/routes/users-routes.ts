import { Router } from 'express';
import { UsersController } from '@/controllers/users-controller.js';

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post('/', usersController.create);

usersRoutes.post('/login', usersController.login);

export { usersRoutes };
