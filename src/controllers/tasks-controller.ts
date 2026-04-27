import type { Request, Response } from 'express';
import { z } from 'zod';
import { createTask } from '@/services/tasks/create-task.js';
import { removeTask } from '@/services/tasks/remove-task.js';
import { listTasks } from '@/services/tasks/list-tasks.js';
import { updateTask } from '@/services/tasks/update-task.js';
import { assignTask } from '@/services/tasks/assign-task.js';
import { unassignTask } from '@/services/tasks/unassign-task.js';

const teamIDSchema = z.object({
  teamID: z.coerce.number({ error: 'A valid team ID is required as a number' }),
});
const taskIDSchema = z.object({
  taskID: z.coerce.number({ error: 'A valid task ID is required as a number' }),
});

class TasksController {
  async create(req: Request, res: Response) {
    //Validate request parameters using zod
    const { teamID } = teamIDSchema.parse(req.params);

    // Validate request body using zod
    const taskSchema = z.object({
      title: z
        .string({ error: 'Task title is required' })
        .min(4, { error: 'Task title must be at least 4 characters long' }),
      description: z
        .string({ error: 'Task description is required' })
        .min(8, { error: 'Task description must be at least 8 characters long' }),
      priority: z
        .enum(['low', 'medium', 'high'], {
          error: 'Priority must be : low, medium or high',
        })
        .optional(),
      assignedTo: z.number({ error: 'Assigned user ID must be a number' }).optional(),
    });

    const { title, description, priority, assignedTo } = taskSchema.parse(req.body);

    // Structure the task data before creation
    const taskData = {
      title,
      description,
      ...(priority !== undefined ? { priority } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
    };

    // Call the service function to create the task
    const newTask = await createTask(taskData, teamID);

    // Return the created task in the response
    return res.status(201).json({ message: 'Task created successfully', task: newTask });
  }

  async list(req: Request, res: Response) {
    // Validate request parameters using zod
    const { teamID } = teamIDSchema.parse(req.params);

    //validate query parameters using zod
    const querySchema = z.object({
      status: z
        .enum(['pending', 'in_progress', 'completed'], {
          error: 'Status filter must be : pending, in_progress or completed',
        })
        .optional(),
      priority: z
        .enum(['low', 'medium', 'high'], {
          error: 'Priority filter must be : low, medium or high',
        })
        .optional(),
    });

    const query = querySchema.parse(req.query);

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Remove undefined properties from filters
    const filters = {
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
    };

    // Call the service function to get the list of tasks for the team
    const tasks = await listTasks(teamID, req.user, filters);

    // Return the list of tasks in the response
    return res.status(200).json({ message: 'List of tasks retrieved successfully', tasks });
  }

  async update(req: Request, res: Response) {
    // Validate request parameters using zod
    const { teamID } = teamIDSchema.parse(req.params);
    const { taskID } = taskIDSchema.parse(req.params);

    // Validate request body using zod
    const taskUpdateSchema = z.object({
      title: z
        .string({ error: 'Task title must be a string' })
        .min(4, { error: 'Task title must be at least 4 characters long' })
        .optional(),
      description: z
        .string({ error: 'Task description must be a string' })
        .min(8, { error: 'Task description must be at least 8 characters long' })
        .optional(),
      priority: z
        .enum(['low', 'medium', 'high'], { error: 'Priority must be : low, medium or high' })
        .optional(),
      status: z.enum(['pending', 'in_progress', 'completed'], {
        error: 'Status must be : pending, in_progress or completed',
      }),
    });

    const updateData = taskUpdateSchema.parse(req.body);

    // Call the service function to update the task
    let updatedTask;
    if (req.user) {
      updatedTask = await updateTask(updateData, teamID, taskID, req.user);
    }

    // Return a success message in the response
    return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  }

  async delete(req: Request, res: Response) {
    // Validate request parameters using zod
    const { teamID } = teamIDSchema.parse(req.params);
    const { taskID } = taskIDSchema.parse(req.params);

    // Call the service function to remove the task
    const deletedTask = await removeTask(taskID, teamID);

    // Return a success message in the response
    return res.status(200).json({
      message: `Task '${deletedTask.title}' with ID ${deletedTask.id} deleted successfully`,
    });
  }

  async assign(req: Request, res: Response) {
    // Validate request parameters using zod
    const { teamID } = teamIDSchema.parse(req.params);
    const { taskID } = taskIDSchema.parse(req.params);

    // Validate request body using zod
    const taskAssignSchema = z.object({
      assignedTo: z.number({ error: 'Assigned user ID must be a number' }).nullable().optional(),
    });

    const { assignedTo } = taskAssignSchema.parse(req.body);

    // Check if task is being assigned or unassigned
    let isUnassigning = false;
    if (assignedTo !== undefined && (assignedTo === null || assignedTo <= 0)) {
      isUnassigning = true;
    }

    if (!isUnassigning) {
      // Structure the assignment data before calling the service

      const params = {
        teamID,
        taskID,
        ...(assignedTo && { assignedTo: assignedTo }),
        ...(req.user && { user: req.user }),
      };

      // Call the service function to assign the task
      const { updatedTask, assignedUser } = await assignTask(params);

      // Return the assigned task in the response
      return res.status(200).json({
        message: `Task successfully assigned to user: ${assignedUser.name} `,
        task: updatedTask,
      });
    } else {
      // Structure the unassignment data before calling the service
      const params = {
        teamID,
        taskID,
        ...(req.user && { user: req.user }),
      };

      // Call the service function to unassign the task
      const { updatedTask } = await unassignTask(params);

      // Return the unassigned task in the response
      return res.status(200).json({
        message: 'Task successfully unassigned',
        task: updatedTask,
      });
    }
  }
}

export { TasksController };
