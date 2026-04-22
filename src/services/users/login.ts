import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authConfig } from '@/configs/auth.js';

export async function login({ email, password }: UserLogin) {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  //check if user exists
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare the provided password with the hashed password
  const passwordMatch = await compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate a JWT token for the authenticated user
  const { secret, expiresIn } = authConfig.jwt;
  const token = jwt.sign({ role: user.role }, secret, {
    subject: String(user.id),
    expiresIn,
  });

  // Exclude the password from the user object before returning it
  const { password: _, ...userWithoutPassword } = user;

  // Return the generated token and the user information
  return { token, user: userWithoutPassword };
}
