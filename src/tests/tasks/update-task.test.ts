import request from 'supertest';
import { app } from '../../app.js';
import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/prisma.js';
import 'dotenv/config';
import { adminLogin } from '../admin-login.js';
import { memberLogin } from '../member-login.js';

describe('PATCH /teams/:teamID/tasks/:taskID', () => {
  let adminToken: string | undefined;
  let memberToken: string | undefined;
  //const memberID: number = 2;
  const teamID: number = 2;
  const ownedTaskID: number = 2;
  const unownedTaskID: number = 4;

  beforeAll(async () => {
    adminToken = await adminLogin();
    memberToken = await memberLogin();
  });

  afterAll(async () => {
    await request(app)
      .patch(`/teams/${teamID}/tasks/${unownedTaskID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unupdated Task Title ',
        description: 'Unupdated Task Description ',
        priority: 'low',
        status: 'pending',
      });

    // reset the owned task to be assigned to the member and have its original title and description
    await request(app)
      .patch(`/teams/${teamID}/tasks/${ownedTaskID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unupdated Task Title',
        description: 'Unupdated Task Description',
        priority: 'low',
        status: 'pending',
      });

    adminToken = undefined;
    memberToken = undefined;
  });

  it('should confirm task and team exist', async () => {
    const team = await prisma.team.findUnique({
      where: { id: teamID },
    });

    const task1 = await prisma.task.findFirst({
      where: {
        id: ownedTaskID,
        teamId: teamID,
      },
    });

    const task2 = await prisma.task.findFirst({
      where: {
        id: unownedTaskID,
        teamId: teamID,
      },
    });

    expect(team).toBeDefined();
    expect(task1).toBeDefined();
    expect(task2).toBeDefined();
  });

  it('should throw an error if the team does not exist', async () => {
    const response = await request(app)
      .patch(`/teams/9999/tasks/${ownedTaskID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Attempted Update on Nonexistent Team',
        status: 'in_progress',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should throw an error if the task does not exist in the specified team', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/9999`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Attempted Update on Nonexistent Task',
        status: 'in_progress',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found in the specified team');
  });

  it('should allow an admin to update any task in the team', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${unownedTaskID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Updated Task Title by Admin',
        description: 'Updated Task Description by Admin',
        priority: 'high',
        status: 'in_progress',
      });

    expect(response.status).toBe(200);
    expect(response.body.task.title).toBe('Updated Task Title by Admin');
    expect(response.body.task.description).toBe('Updated Task Description by Admin');
  });

  it('should allow a member to update their own assigned task', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${ownedTaskID}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        title: 'Updated Task Title by Member',
        description: 'Updated Task Description by Member',
        priority: 'medium',
        status: 'in_progress',
      });

    expect(response.status).toBe(200);
    expect(response.body.task.title).toBe('Updated Task Title by Member');
    expect(response.body.task.description).toBe('Updated Task Description by Member');
  });

  it('should create a history record when the status is updated both by admin and member', async () => {
    //since status was changed to in_progress in the previous test, we will just check if a history record was created for that change
    let historyRecord = await prisma.taskHistory.findFirst({
      where: {
        taskId: unownedTaskID,
        newStatus: 'in_progress',
      },
    });

    expect(historyRecord).toBeDefined();
    expect(historyRecord?.taskId).toBe(unownedTaskID);
    expect(historyRecord?.oldStatus).toBe('pending');
    expect(historyRecord?.newStatus).toBe('in_progress');

    historyRecord = await prisma.taskHistory.findFirst({
      where: {
        taskId: ownedTaskID,
        newStatus: 'in_progress',
      },
    });

    expect(historyRecord).toBeDefined();
    expect(historyRecord?.taskId).toBe(ownedTaskID);
    expect(historyRecord?.oldStatus).toBe('pending');
    expect(historyRecord?.newStatus).toBe('in_progress');
  });

  it('should not allow a member to update a task that is not assigned to them', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${unownedTaskID}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        title: 'Attempted Update by Member',
        description: 'This update should not succeed',
        priority: 'low',
        status: 'pending',
      });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('User does not have permission to update this task');
  });

  it('should throw an error if status is not defined', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${ownedTaskID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Attempted Update with Invalid Status',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
});
