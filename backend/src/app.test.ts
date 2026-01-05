import request from 'supertest';
import app from './app.js';
import { db, initializeSchema } from './db.js';
import { clearAll } from './repositories.js';

initializeSchema();

describe('Attendance API', () => {
  beforeEach(async () => {
    await clearAll();
  });

  afterAll(() => {
    db.close();
  });

  it('creates students and sessions then records attendance', async () => {
    const studentRes = await request(app).post('/students').send({ name: '田中 太郎', grade: '中3' });
    expect(studentRes.status).toBe(201);
    const sessionRes = await request(app).post('/sessions').send({ date: '2024-04-01', topic: '数学' });
    expect(sessionRes.status).toBe(201);

    const attendanceRes = await request(app)
      .post('/attendance')
      .send({ studentId: studentRes.body.id, sessionId: sessionRes.body.id, status: 'present', note: '元気' });
    expect(attendanceRes.status).toBe(201);

    const listRes = await request(app).get('/attendance').query({ sessionId: sessionRes.body.id });
    expect(listRes.status).toBe(200);
    expect(listRes.body[0].status).toBe('present');
  });
});
