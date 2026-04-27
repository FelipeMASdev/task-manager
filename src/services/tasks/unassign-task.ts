import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function unassignTask(assignData: {
  teamID: number;
  taskID: number;
  user?: { id: number; role: string };
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

  // Check if user role is admin
  if (assignData.user?.role !== 'admin') {
    throw new AppError('Only admins can unassign tasks', 403);
  }

  // Check if the task is already unassigned
  if (task.assignedTo === null) {
    throw new AppError('Task is already unassigned', 400);
  }

  // Unassign the task by setting assignedTo to null
  const updatedTask = await prisma.task.update({
    where: { id: assignData.taskID },
    data: { assignedTo: null },
  });

  // Return the updated task
  return { updatedTask: updatedTask };
}
