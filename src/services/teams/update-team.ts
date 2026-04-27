import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function updateTeam(team: Team) {
  // Check if the team with the given ID exists
  const existingTeam = await prisma.team.findUnique({
    where: {
      id: team.id,
    },
  });

  if (!existingTeam) {
    throw new AppError('Team not found', 404);
  }

  // Validate that at least one of the fields (name or description) is provided for update
  if (!team.name && !team.description) {
    throw new AppError('At least one between name or description must be provided for update');
  }

  // Update team in the database
  const updatedTeam = await prisma.team.update({
    where: {
      id: team.id,
    },
    data: {
      ...(team.name !== undefined ? { name: team.name } : {}),
      ...(team.description !== undefined ? { description: team.description } : {}),
    },
  });

  // Return the updated team
  return { ...updatedTeam };
}
