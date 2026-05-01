import { prisma } from '@/prisma.js';
import { AppError } from '@/utils/AppError.js';

export async function addAdmin(userId: number) {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if the user is already an admin
  if (user.role === 'admin') {
    throw new AppError('User is already an admin', 400);
  }

  // Update the user's role to admin
  const response = await prisma.user.update({
    where: { id: userId },
    data: { role: 'admin' },
  });

  const { password: _, ...newAdmin } = response;

  // Return a success message
  return newAdmin;
}
