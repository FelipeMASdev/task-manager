import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function deleteTeam(teamId: number) {
  // Check if the team with the given ID exists
  const existingTeam = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!existingTeam) {
    throw new AppError('Team not found', 404);
  }

  // Delete team from the database
  const deletedTeam = await prisma.team.delete({
    where: {
      id: existingTeam.id,
    },
  });

  // Return the deleted team
  return { deletedId: deletedTeam.id, deletedName: deletedTeam.name };
}
