import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';
import { hash } from 'bcrypt';
import { Prisma } from '@/generated/prisma/client.js';

export async function createUser(user: NewUser) {
  try {
    // Create user in the database, hashing the password before saving
    const newUser = await prisma.user.create({
      data: {
        ...user,
        password: await hash(user.password, 8),
      },
    });

    // Remove the password from the returned user object
    const { password: _, ...newUserWithoutPassword } = newUser;

    // Return the new user without the password
    return { ...newUserWithoutPassword };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('User with this email already exists', 409);
    }

    throw error;
  }
}
