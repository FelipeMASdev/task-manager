import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';
import type { authenticatedUser } from '@/types/authenticated-user.js';

export async function listTaskHistory({
  teamID,
  taskID,
  user,
}: {
  teamID: number;
  taskID: number;
  user: authenticatedUser;
}) {
  // Validate that the task exists in the specified team
  const task = await prisma.task.findFirst({
    where: {
      id: taskID,
      teamId: teamID,
    },
  });

  if (!task) {
    throw new AppError('Task not found in the specified team', 404);
  }

  // Validate that the user is a member of the team or admin
  if (user.role !== 'admin') {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: teamID,
        userId: user.id,
      },
    });

    if (!teamMember) {
      throw new AppError('User is not a member of the specified team', 403);
    }
  }

  // Fetch the task history
  const taskHistory = await prisma.taskHistory.findMany({
    where: {
      taskId: taskID,
    },
    orderBy: {
      changedAt: 'desc',
    },
  });

  // Return the task history
  return { task, taskHistory };
}
