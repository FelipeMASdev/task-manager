import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';
import { Prisma } from '@/generated/prisma/client.js';

export async function addMember(teamID: number, userID: number) {
  // Validate that the team exists
  const team = await prisma.team.findUnique({
    where: { id: teamID },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Validate that the user exists
  const user = await prisma.user.findUnique({
    where: { id: userID },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  try {
    // Add the user to the team in the database
    const membership = await prisma.teamMember.create({
      data: {
        userId: userID,
        teamId: teamID,
      },
    });

    return { ...membership };
  } catch (error) {
    // Handle unique constraint violation (e.g., teamID and userID combination already exists)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('User is already a member of this team', 409);
    }

    throw error;
  }
}
