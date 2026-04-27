import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function assignTask(assignData: {
  teamID: number;
  taskID: number;
  user?: { id: number; role: string };
  assignedTo?: number | null;
}) {
  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: assignData.teamID },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Check if task exists and belongs to the team
  const task = await prisma.task.findUnique({
    where: { id: assignData.taskID },
    include: { team: true },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.teamId !== assignData.teamID) {
    throw new AppError('Task does not belong to the specified team', 400);
  }

  //check if user role is member
  if (assignData.user?.role === 'member') {
    // Check if a member is trying to assign the task to another user
    if (assignData.assignedTo && assignData.user.id !== assignData.assignedTo) {
      throw new AppError('Only admins can assign tasks to other users', 403);
    }

    // Check if a member is trying to reassign a task that is already assigned to someone
    if (task.assignedTo && assignData.user.id !== task.assignedTo) {
      throw new AppError(
        'Members cannot reassign tasks that are already assigned to someone else',
        403,
      );
    }
  }

  // If no user is specified to assign the task to, assign it to the current user
  if (!assignData.assignedTo && assignData.user?.id) {
    assignData.assignedTo = assignData.user.id;
  }

  // Check if the task has a target to assign to
  if (!assignData.assignedTo) {
    throw new AppError('Failed to assign task', 400);
  }

  // Check if the task is already assigned to the same user
  if (task.assignedTo === assignData.assignedTo) {
    throw new AppError('Task is already assigned to the specified user', 400);
  }

  // Check if the assigned user exists
  const assignedUser = await prisma.user.findUnique({
    where: { id: assignData.assignedTo },
  });

  if (!assignedUser) {
    throw new AppError('Assigned user not found', 404);
  }

  // Check if the assigned user is a member of the team
  const isTeamMember = await prisma.teamMember.findFirst({
    where: {
      userId: assignData.assignedTo,
      teamId: assignData.teamID,
    },
  });

  if (!isTeamMember) {
    throw new AppError('Assigned user must be a member of the team', 400);
  }

  // Update the task with the new assigned user
  const updatedTask = await prisma.task.update({
    where: { id: assignData.taskID },
    data: { assignedTo: assignedUser?.id },
  });

  // Return the updated task
  return { updatedTask: updatedTask, assignedUser: assignedUser };
}
