import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function updateTask(
  updateData: object,
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

  // Update the task in the database
  await prisma.task.update({
    where: {
      id: taskID,
    },
    data: updateData,
  });

  // Retrieve the updated task from the database
  const updatedTask = await prisma.task.findUnique({
    where: { id: taskID },
  });

  // Return the updated task
  return updatedTask;
}
