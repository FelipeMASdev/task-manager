import type { Request, Response } from 'express';
import { z } from 'zod';
import { listTaskHistory } from '@/services/task-history/list-task-history.js';
import type { authenticatedUser } from '@/types/authenticated-user.js';

const teamIDSchema = z.object({
  teamID: z.coerce.number({ error: 'A valid team ID is required as a number' }),
});
const taskIDSchema = z.object({
  taskID: z.coerce.number({ error: 'A valid task ID is required as a number' }),
});

class TaskHistoryController {
  async list(req: Request, res: Response) {
    // Validate request parameters using zod
    const { teamID } = teamIDSchema.parse(req.params);
    const { taskID } = taskIDSchema.parse(req.params);

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // structure the parameters for the service function
    const user: authenticatedUser = req.user;

    //Call the service function to get the task history
    const taskHistory = await listTaskHistory({ teamID, taskID, user });

    // Return the task history in the response
    return res.status(200).json({ message: 'Task history listed successfully', ...taskHistory });
  }
}

export { TaskHistoryController };
