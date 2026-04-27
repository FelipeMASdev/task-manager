import { Router } from 'express';
import { TasksController } from '@/controllers/tasks-controller.js';
import { verifyAuthentication } from '@/middlewares/verify-authentication.js';
import { verifyAuthorization } from '@/middlewares/verify-authorization.js';

const tasksRoutes = Router({ mergeParams: true });
const tasksController = new TasksController();

tasksRoutes.post('/', verifyAuthentication, verifyAuthorization(['admin']), tasksController.create);
tasksRoutes.get(
  '/',
  verifyAuthentication,
  verifyAuthorization(['admin', 'member']),
  tasksController.list,
);
tasksRoutes.patch(
  '/:taskID',
  verifyAuthentication,
  verifyAuthorization(['admin', 'member']),
  tasksController.update,
);
tasksRoutes.delete(
  '/:taskID',
  verifyAuthentication,
  verifyAuthorization(['admin']),
  tasksController.delete,
);

tasksRoutes.patch(
  '/:taskID/assign',
  verifyAuthentication,
  verifyAuthorization(['admin', 'member']),
  tasksController.assign,
);

export { tasksRoutes };
