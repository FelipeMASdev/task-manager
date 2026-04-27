import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

interface newTask {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: number;
}

export async function createTask(task: newTask, teamID: number) {
  // Validate if the team exists
  const team = await prisma.team.findUnique({
    where: { id: teamID },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Validate if the assigned user exists
  if (task.assignedTo) {
    const user = await prisma.user.findUnique({
      where: { id: task.assignedTo },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }
  }

  // Validate if the assigned user is part of the team
  if (task.assignedTo) {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: teamID,
        userId: task.assignedTo,
      },
    });

    if (!teamMember) {
      throw new AppError('User is not a member of the team', 400);
    }
  }

  // Create the task in the database
  const newTask = await prisma.task.create({
    data: {
      ...task,
      teamId: teamID,
    },
  });

  // return the created task
  return newTask;
}
