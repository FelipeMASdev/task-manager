import type { Request, Response } from 'express';
import { z } from 'zod';
import { addMember } from '@/services/team-members/add-member.js';
import { listMembers } from '@/services/team-members/list-members.js';
import { removeMember } from '@/services/team-members/remove-member.js';

const teamIdParamSchema = z.object({
  teamID: z.coerce.number({ error: 'A valid team ID is required as a number' }),
});

const membershipParamSchema = z.object({
  teamID: z.coerce.number({ error: 'A valid team ID is required as a number' }),
  userID: z.coerce.number({ error: 'A valid user ID is required as a number' }),
});

const userIdBodySchema = z.object({
  userID: z.number({ error: 'A valid user ID is required as a number' }),
});

class TeamMembersController {
  async create(req: Request, res: Response) {
    // Validate the team ID from the request parameters
    const { teamID } = teamIdParamSchema.parse(req.params);

    // Validate the user ID from the request body
    const { userID } = userIdBodySchema.parse(req.body);

    // Call the service to add the user to the team
    const membership = await addMember(teamID, userID);

    // Return a success response
    return res.status(201).json({
      message: `User with ID ${userID} added to team with ID ${teamID} successfully`,
      membership,
    });
  }

  async list(req: Request, res: Response) {
    // Validate the team ID from the request parameters
    const { teamID } = teamIdParamSchema.parse(req.params);

    // Structure the user information before calling the service
    const listParams = {
      teamID,
      ...(req.user ? { user: req.user } : {}),
    };

    // Call the service to list the team members
    const memberships = await listMembers(listParams);

    // Return the list of team members in the response
    return res.status(200).json({ team: memberships });
  }

  async delete(req: Request, res: Response) {
    // Validate team and user IDs from the request parameters
    const { teamID, userID } = membershipParamSchema.parse(req.params);

    // Call the service to remove the user from the team
    const membership = await removeMember(teamID, userID);

    // Return a success response
    return res.status(200).json({
      message: `User with ID ${membership.userId} removed from team with ID ${membership.teamId} successfully`,
    });
  }
}

export { TeamMembersController };
