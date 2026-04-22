import type { Request, Response } from 'express';
import { z } from 'zod';
import { createTeam } from '@/services/teams/create-team.js';

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
}

export { TeamsController };
