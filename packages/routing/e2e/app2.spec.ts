import request from 'supertest';
import { HttpServer } from '@ditsmod/core';
import { TestApplication } from '@ditsmod/testing';

import { AppModule } from './app2/app.module.js';

describe('routing app2', () => {
  let server: HttpServer;
  let testAgent: ReturnType<typeof request>;

  beforeAll(async () => {
    server = await TestApplication.createTestApp(AppModule).getServer();
    testAgent = request(server);
  });

  afterAll(() => {
    server?.close();
  });

  it('controller from root module', async () => {
    const { status, type, text } = await testAgent.get('/controller0');
    expect(status).toBe(200);
    expect(type).toBe('text/plain');
    expect(text).toBe('controller0');
  });

  it('imports module1 with controllers', async () => {
    const { status, type, text } = await testAgent.get('/module1/controller1');
    expect(status).toBe(200);
    expect(type).toBe('text/plain');
    expect(text).toBe('controller1');
  });

  it('appends module2 with controllers with "path"', async () => {
    const { status, type, text } = await testAgent.get('/module2/controller2');
    expect(status).toBe(200);
    expect(type).toBe('text/plain');
    expect(text).toBe('controller2');
  });

  it('appends module2 with controllers without "path"', async () => {
    const { status, type, text } = await testAgent.get('/controller2');
    expect(status).toBe(200);
    expect(type).toBe('text/plain');
    expect(text).toBe('controller2');
  });
});