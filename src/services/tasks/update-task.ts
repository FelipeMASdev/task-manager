import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

export async function updateTask(
  updateData: UpdateTaskData,
  teamID: number,
  taskID: number,
  user: { id: number; role: string },
) {
  // Validate if the team exists
  const team = await prisma.team.findUnique({
    where: { id: teamID },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Validate if the task exists and belongs to the team
  const task = await prisma.task.findFirst({
    where: {
      id: taskID,
      teamId: teamID,
    },
  });

  if (!task) {
    throw new AppError('Task not found in the specified team', 404);
  }

  // Check if the user has permission to update the task
  if (user.role !== 'admin') {
    // Verify the user is a member of the team
    const isTeamMember = await prisma.teamMember.findFirst({
      where: { teamId: teamID, userId: user.id },
    });

    if (!isTeamMember) {
      throw new AppError('User is not a member of the specified team', 403);
    }

    // Verify the task is assigned to the user
    if (task.assignedTo !== user.id) {
      throw new AppError('User does not have permission to update this task', 403);
    }
  }

  // Update the task in the database and create a history record if the status has changed
  const [updatedTask] = await prisma.$transaction([
    prisma.task.update({
      where: {
        id: taskID,
      },
      data: updateData,
    }),

    ...(updateData.status && updateData.status !== task.status
      ? [
          prisma.taskHistory.create({
            data: {
              taskId: taskID,
              changedBy: user.id,
              oldStatus: task.status,
              newStatus: updateData.status,
            },
          }),
        ]
      : []),
  ]);

  // Return the updated task
  return updatedTask;
}
