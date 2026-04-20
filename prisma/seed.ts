import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL nao definido no ambiente.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function ensureTeam(name: string, description: string) {
    const existing = await prisma.team.findFirst({
        where: { name },
    });

    if (existing) {
        return prisma.team.update({
            where: { id: existing.id },
            data: { description },
        });
    }

    return prisma.team.create({
        data: { name, description },
    });
}

async function ensureMembership(userId: number, teamId: number) {
    return prisma.teamMember.upsert({
        where: {
            userId_teamId: { userId, teamId },
        },
        update: {},
        create: {
            userId,
            teamId,
        },
    });
}

async function main() {
    await prisma.taskHistory.deleteMany();
    await prisma.task.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    const [admin, maria, joao, paula, carlos, lucia] = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@taskmanager.com' },
            update: {},
            create: {
                name: 'Admin',
                email: 'admin@taskmanager.com',
                password: '123456',
                role: 'admin',
            },
        }),
        prisma.user.upsert({
            where: { email: 'maria@taskmanager.com' },
            update: {},
            create: {
                name: 'Maria',
                email: 'maria@taskmanager.com',
                password: '123456',
                role: 'member',
            },
        }),
        prisma.user.upsert({
            where: { email: 'joao@taskmanager.com' },
            update: {},
            create: {
                name: 'Joao',
                email: 'joao@taskmanager.com',
                password: '123456',
                role: 'member',
            },
        }),
        prisma.user.upsert({
            where: { email: 'paula@taskmanager.com' },
            update: {},
            create: {
                name: 'Paula',
                email: 'paula@taskmanager.com',
                password: '123456',
                role: 'member',
            },
        }),
        prisma.user.upsert({
            where: { email: 'carlos@taskmanager.com' },
            update: {},
            create: {
                name: 'Carlos',
                email: 'carlos@taskmanager.com',
                password: '123456',
                role: 'member',
            },
        }),
        prisma.user.upsert({
            where: { email: 'lucia@taskmanager.com' },
            update: {},
            create: {
                name: 'Lucia',
                email: 'lucia@taskmanager.com',
                password: '123456',
                role: 'member',
            },
        }),
    ]);

    const [produto, engenharia, design] = await Promise.all([
        ensureTeam('Produto', 'Time de Produto'),
        ensureTeam('Engenharia', 'Time de Engenharia'),
        ensureTeam('Design', 'Time de Design'),
    ]);

    await Promise.all([
        ensureMembership(admin.id, produto.id),
        ensureMembership(maria.id, produto.id),
        ensureMembership(joao.id, engenharia.id),
        ensureMembership(admin.id, engenharia.id),
        ensureMembership(paula.id, produto.id),
        ensureMembership(carlos.id, engenharia.id),
        ensureMembership(lucia.id, design.id),
        ensureMembership(maria.id, design.id),
    ]);

    const tasks = [
        {
            title: 'Definir backlog da sprint',
            description: 'Organizar prioridades e quebrar entregas em tarefas menores.',
            status: 'pending' as const,
            priority: 'high' as const,
            assigneeId: admin.id,
            teamId: produto.id,
        },
        {
            title: 'Implementar autenticação',
            description: 'Criar fluxo de login e proteção de rotas da API.',
            status: 'in_progress' as const,
            priority: 'high' as const,
            assigneeId: joao.id,
            teamId: engenharia.id,
        },
        {
            title: 'Revisar identidade visual',
            description: 'Ajustar guias visuais e consistência de componentes.',
            status: 'completed' as const,
            priority: 'medium' as const,
            assigneeId: lucia.id,
            teamId: design.id,
        },
        {
            title: 'Criar endpoints de tarefas',
            description: 'Expor CRUD principal para task manager.',
            status: 'pending' as const,
            priority: 'high' as const,
            assigneeId: carlos.id,
            teamId: engenharia.id,
        },
        {
            title: 'Preparar painel de métricas',
            description: 'Consolidar indicadores para acompanhamento do time.',
            status: 'pending' as const,
            priority: 'medium' as const,
            assigneeId: maria.id,
            teamId: produto.id,
        },
        {
            title: 'Ajustar tokens de interface',
            description: 'Padronizar espaçamentos, cores e tipografia do produto.',
            status: 'in_progress' as const,
            priority: 'low' as const,
            assigneeId: lucia.id,
            teamId: design.id,
        },
        {
            title: 'Validar regras de negócio',
            description: 'Cobrir cenários de criação, atualização e remoção.',
            status: 'completed' as const,
            priority: 'medium' as const,
            assigneeId: admin.id,
            teamId: engenharia.id,
        },
        {
            title: 'Documentar payloads da API',
            description: 'Registrar contratos de entrada e saída dos endpoints.',
            status: 'pending' as const,
            priority: 'low' as const,
            assigneeId: paula.id,
            teamId: produto.id,
        },
    ];

    const createdTasks = [];

    for (const task of tasks) {
        const record = await prisma.task.create({
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                assignedTo: task.assigneeId,
                teamId: task.teamId,
            },
        });

        createdTasks.push(record);
    }

    const historyEntries = [
        {
            taskId: createdTasks[1].id,
            changedBy: joao.id,
            oldStatus: 'pending' as const,
            newStatus: 'in_progress' as const,
        },
        {
            taskId: createdTasks[2].id,
            changedBy: lucia.id,
            oldStatus: 'in_progress' as const,
            newStatus: 'completed' as const,
        },
        {
            taskId: createdTasks[4].id,
            changedBy: maria.id,
            oldStatus: 'pending' as const,
            newStatus: 'in_progress' as const,
        },
        {
            taskId: createdTasks[6].id,
            changedBy: admin.id,
            oldStatus: 'in_progress' as const,
            newStatus: 'completed' as const,
        },
        {
            taskId: createdTasks[7].id,
            changedBy: paula.id,
            oldStatus: 'pending' as const,
            newStatus: 'pending' as const,
        },
    ];

    for (const entry of historyEntries) {
        await prisma.taskHistory.create({
            data: {
                taskId: entry.taskId,
                changedBy: entry.changedBy,
                oldStatus: entry.oldStatus,
                newStatus: entry.newStatus,
            },
        });
    }

    const summary = await prisma.team.findMany({
        select: {
            id: true,
            name: true,
            teamMembers: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            tasks: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    taskHistory: {
                        select: {
                            id: true,
                            oldStatus: true,
                            newStatus: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

    console.log('Seed concluido com sucesso');
    console.log(JSON.stringify(summary, null, 2));
}

main()
    .catch((error) => {
        console.error('Erro ao executar seed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
