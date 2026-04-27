import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

interface TeamMembers {
  Team_ID: number;
  Team_Name: string;
  members: TeamMemberInfo[];
}

interface TeamMemberInfo {
  userId: number;
  userName: string;
  userEmail: string;
  addedAt: Date;
}

export async function listMembers(params: { teamID: number; user?: { id: number; role: string } }) {
  // Destructure the parameters to get teamID and user information
  const { teamID, user } = params;

  // Check if the user is authenticated
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  // Check if user is a member of the team or admin
  const isTeamMember = await prisma.teamMember.findFirst({
    where: {
      userId: user.id,
      teamId: teamID,
    },
  });

  if (!isTeamMember && user.role !== 'admin') {
    throw new AppError('Only team members and admins can view team members', 403);
  }

  // Validate that the team exists and load members with user details.
  const team = await prisma.team.findUnique({
    where: { id: teamID },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Transform the team member objects into the desired format.
  const teamMembers: TeamMemberInfo[] = team.teamMembers.map((member) => ({
    userId: member.userId,
    userName: member.user.name,
    userEmail: member.user.email,
    addedAt: member.createdAt,
  }));

  // Construct the response object with team details and member information.
  const memberships: TeamMembers = {
    Team_ID: teamID,
    Team_Name: team.name,
    members: teamMembers,
  };

  // Return the structured team membership information.
  return { ...memberships };
}
