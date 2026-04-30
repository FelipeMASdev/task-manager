import { Router } from 'express';
import { TaskHistoryController } from '@/controllers/task-history-controller.js';
import { verifyAuthentication } from '@/middlewares/verify-authentication.js';
import { verifyAuthorization } from '@/middlewares/verify-authorization.js';

const taskHistoryRoutes = Router({ mergeParams: true });
const taskHistoryController = new TaskHistoryController();

taskHistoryRoutes.get(
  '/history',
  verifyAuthentication,
  verifyAuthorization(['admin', 'member']),
  taskHistoryController.list,
);

export { taskHistoryRoutes };
