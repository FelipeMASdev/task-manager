import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function removeTask(taskID: number, teamID: number) {
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

  // Extract the title and id from the task
  const { title, id } = task;

  // Delete the task from the database
  await prisma.task.delete({
    where: {
      id: taskID,
    },
  });

  // return the deleted task
  return { title, id };
}
