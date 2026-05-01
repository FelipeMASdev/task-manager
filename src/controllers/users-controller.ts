import { createUser } from '@/services/users/create-user.js';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { login } from '@/services/users/login.js';
import { addAdmin } from '@/services/users/add-admin.js';

class UsersController {
  async create(req: Request, res: Response) {
    // Validate the request body using Zod schema
    const bodySchema = z.object({
      name: z
        .string({ error: 'A valid name is required as a string' })
        .trim()
        .min(2, 'Name must be at least 2 characters long'),
      email: z.email('Invalid email address'),
      password: z
        .string({ error: 'A valid password is required as a string' })
        .min(6, 'Password must be at least 6 characters long'),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    // Call the createUser service to create a new user
    const user = await createUser({ name, email, password });

    // Return a success response with the created user
    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  }

  async login(req: Request, res: Response) {
    // Validate the request body using Zod schema
    const bodySchema = z.object({
      email: z.email('Invalid email address'),
      password: z
        .string({ error: 'A valid password is required as a string' })
        .min(6, 'Password must be at least 6 characters long'),
    });

    const { email, password } = bodySchema.parse(req.body);

    // Call the login service to authenticate the user
    const { token, user } = await login({ email, password });

    // Return a success response with the generated token and user information
    return res.json({ token, user });
  }

  async addAdmin(req: Request, res: Response) {
    // Validate the request params using Zod
    const paramsSchema = z.object({
      userID: z.coerce.number({ error: 'A valid user ID is required as a number' }),
    });

    const { userID } = paramsSchema.parse(req.params);

    // Call the addAdmin service to grant admin privileges to the user
    const newAdmin = await addAdmin(userID);

    // Return a success response
    return res.status(200).json({
      message: 'User promoted to admin successfully',
      newAdmin,
    });
  }
}

export { UsersController };
