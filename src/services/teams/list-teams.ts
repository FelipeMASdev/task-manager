import { prisma } from '@/prisma.js';

export async function listTeams() {
  const teams = await prisma.team.findMany();

  return teams;
}
