import type { Request, Response } from 'express';
import { z } from 'zod';
import { createTeam } from '@/services/teams/create-team.js';
import { listTeams } from '@/services/teams/list-teams.js';
import { updateTeam } from '@/services/teams/update-team.js';
import { deleteTeam } from '@/services/teams/delete-team.js';

class TeamsController {
  async create(req: Request, res: Response) {
    // Validate the request body using Zod schema
    const bodySchema = z.object({
      name: z
        .string({ error: 'A valid name is required as a string' })
        .min(2, 'Name must be at least 2 characters long'),
      description: z
        .string({ error: 'A team description is required as a string' })
        .min(10, 'Description must be at least 10 characters long'),
    });
    const { name, description } = bodySchema.parse(req.body);

    // Call the service to create the team in the database
    const newTeam = await createTeam({ name, description });

    // Return a success response with the created team
    return res.status(201).json({
      message: 'Team created successfully',
      team: newTeam,
    });
  }

  async list(req: Request, res: Response) {
    // Call the service to list teams from the database
    const teams = await listTeams();

    // Return a success response with the list of teams
    return res.status(200).json({
      message: 'List of teams retrieved successfully',
      teams,
    });
  }

  async update(req: Request, res: Response) {
    // Validate the team ID from the request parameters
    const paramsSchema = z.object({
      id: z.coerce.number({ error: 'A valid team ID is required as a number' }),
    });
    const { id } = paramsSchema.parse(req.params);

    // Validate the request body using Zod schema
    const bodySchema = z.object({
      name: z
        .string({ error: 'Name should be a string' })
        .min(2, 'Name must be at least 2 characters long')
        .optional(),
      description: z
        .string({ error: 'Description should be a string' })
        .min(10, 'Description must be at least 10 characters long')
        .optional(),
    });

    const { name, description } = bodySchema.parse(req.body);

    // Call the service to update the team in the database
    const updatedTeam = await updateTeam({ id, name, description });

    // Return a success response with the updated team
    return res.status(200).json({
      message: 'Team updated successfully',
      updatedTeam,
    });
  }

  async delete(req: Request, res: Response) {
    // Validate the team ID from the request parameters
    const paramsSchema = z.object({
      id: z.coerce.number({ error: 'A valid team ID is required as a number' }),
    });
    const { id } = paramsSchema.parse(req.params);

    // Call the service to delete the team from the database
    const { deletedId, deletedName } = await deleteTeam(id);

    // Return a success response confirming the deletion
    return res.status(200).json({
      message: `Team ${deletedName} with ID ${deletedId} deleted successfully`,
    });
  }
}

export { TeamsController };
