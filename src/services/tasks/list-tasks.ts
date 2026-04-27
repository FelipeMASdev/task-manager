import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';
import type { TaskStatus, TaskPriority } from '@/generated/prisma/enums.js';

interface userAuth {
  id: number;
  role: string;
}

export async function listTasks(
  teamID: number,
  user: userAuth,
  filters?: { status?: TaskStatus; priority?: TaskPriority },
) {
  // Check if the team exists
  const team = await prisma.team.findUnique({
    where: { id: teamID },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Check if the user is a member of the team
  if (user.role === 'member') {
    const isTeamMember = await prisma.teamMember.findFirst({
      where: { teamId: teamID, userId: user.id },
    });

    if (!isTeamMember) {
      throw new AppError('User is not a member of the team', 403);
    }
  }

  // Fetch tasks for the team from the database
  const tasks = await prisma.task.findMany({
    where: {
      teamId: teamID,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
    },
  });

  // Return the list of tasks
  return tasks;
}
