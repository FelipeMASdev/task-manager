import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';
import { Prisma } from '@/generated/prisma/client.js';

export async function createTeam(team: NewTeam) {
  try {
    // Create team in the database
    const newTeam = await prisma.team.create({
      data: {
        ...team,
      },
    });

    return { ...newTeam };
  } catch (error) {
    // Handle unique constraint violation (e.g., team name already exists)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Team with this name already exists', 409);
    }

    throw error;
  }
}
