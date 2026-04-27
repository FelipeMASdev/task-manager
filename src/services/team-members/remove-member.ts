import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';
//import { Prisma } from '@/generated/prisma/client.js';

export async function removeMember(teamID: number, userID: number) {
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

  // Validate that the user is a member of the team
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId: userID,
      teamId: teamID,
    },
  });

  if (!membership) {
    throw new AppError('User is not a member of this team', 404);
  }

  // Remove the user from the team
  await prisma.teamMember.delete({
    where: {
      id: membership.id,
    },
  });

  // Return the removed membership information
  return { ...membership };
}
