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
  const memberID: number = 2; // Ensure this is the ID from the member associated with the memberToken
  const teamID: number = 2; // Ensure this team exists in the database
  const taskID: number = 7; // Ensure this task exists, is part of the team
  const anotherTeamTaskID: number = 1; // Ensure this task exists but is part of another team
  const anotherTeamID: number = 1; // Ensure this team exists but is not the one associated with the task
  const anotherMemberID: number = 1; // Ensure this user exists and is a member of the team but is not the one making the request

  beforeAll(async () => {
    adminToken = await adminLogin();
    memberToken = await memberLogin();

    await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: 0,
      });
  });

  afterAll(async () => {
    adminToken = undefined;
    memberToken = undefined;
  });

  it('should confirm task, team, and users exist', async () => {
    const team = await prisma.team.findUnique({
      where: { id: teamID },
    });
    const task1 = await prisma.task.findFirst({
      where: {
        id: taskID,
        teamId: teamID,
      },
    });
    const task2 = await prisma.task.findFirst({
      where: {
        id: anotherTeamTaskID,
        teamId: anotherTeamID,
      },
    });
    const user2 = await prisma.user.findUnique({
      where: { id: anotherMemberID },
    });
    expect(adminToken).toBeDefined();
    expect(memberToken).toBeDefined();
    expect(team).toBeDefined();
    expect(task1).toBeDefined();
    expect(task2).toBeDefined();
    expect(user2).toBeDefined();
  });

  it('should throw an error if the team does not exist', async () => {
    const response = await request(app)
      .patch(`/teams/9999/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: null,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Team not found');
  });

  it('should throw an error if the task does not exist in the specified team', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/9999/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: null,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task not found');
  });

  it('should throw an error if the task does not belong to the specified team', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${anotherTeamTaskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: null,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Task does not belong to the specified team');
  });

  it('should throw an error if a member tries to assign the task to another user', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        assignedTo: anotherMemberID,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Only admins can assign tasks to other users');
  });

  it('should allow admins to assign tasks to other users', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: anotherMemberID,
      });

    expect(response.status).toBe(200);
    expect(response.body.task.assignedTo).toBe(anotherMemberID);
  });

  it('should throw an error if a member tries to reassign a task that is already assigned to someone else', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        assignedTo: memberID,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'Members cannot reassign tasks that are already assigned to someone else',
    );
  });

  it('should allow members to assign a task to themselves if it is unassigned', async () => {
    await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: null,
      });

    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        assignedTo: memberID,
      });

    expect(response.status).toBe(200);
    expect(response.body.task.assignedTo).toBe(memberID);
  });

  it('should throw an error if trying to assign a task to the same user it is already assigned to', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        assignedTo: memberID,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Task is already assigned to the specified user');
  });

  it('should allow admins to unassign a task by setting assignedTo to null', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: null,
      });

    expect(response.status).toBe(200);
    expect(response.body.task.assignedTo).toBe(null);
  });

  it('should throw an error if a member tries to unassign a task', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        assignedTo: null,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Only admins can unassign tasks');
  });

  it('should throw an error if trying to unassign a task that is already unassigned', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: null,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Task is already unassigned');
  });

  it('should throw an error if trying to assign a task without providing a valid assignedTo value', async () => {
    const response = await request(app)
      .patch(`/teams/${teamID}/tasks/${taskID}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignedTo: 'invalid',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
});
