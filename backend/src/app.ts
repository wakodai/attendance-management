import express from 'express';
import cors from 'cors';
import {
  attendanceSummary,
  createSession,
  createStudent,
  listAttendance,
  listSessions,
  listStudents,
  updateStudent,
  upsertAttendance,
} from './repositories.js';
import { initializeSchema } from './db.js';
import { AttendanceStatus } from './types.js';

initializeSchema();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/students', async (_req, res) => {
  try {
    const students = await listStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: '学生一覧の取得に失敗しました', error: `${error}` });
  }
});

app.post('/students', async (req, res) => {
  const { name, grade, contact } = req.body;
  if (!name || !grade) return res.status(400).json({ message: 'name と grade は必須です' });
  try {
    const student = await createStudent({ name, grade, contact });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: '学生登録に失敗しました', error: `${error}` });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const student = await updateStudent(Number(req.params.id), req.body);
    res.json(student);
  } catch (error) {
    res.status(404).json({ message: '学生情報の更新に失敗しました', error: `${error}` });
  }
});

app.get('/sessions', async (_req, res) => {
  try {
    const sessions = await listSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: '授業一覧の取得に失敗しました', error: `${error}` });
  }
});

app.post('/sessions', async (req, res) => {
  const { date, topic } = req.body;
  if (!date || !topic) return res.status(400).json({ message: 'date と topic は必須です' });
  try {
    const session = await createSession({ date, topic });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: '授業登録に失敗しました', error: `${error}` });
  }
});

app.get('/attendance', async (req, res) => {
  const sessionId = Number(req.query.sessionId);
  if (!sessionId) return res.status(400).json({ message: 'sessionId が必要です' });
  try {
    const records = await listAttendance(sessionId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: '出欠一覧の取得に失敗しました', error: `${error}` });
  }
});

app.post('/attendance', async (req, res) => {
  const { studentId, sessionId, status, note } = req.body as {
    studentId: number;
    sessionId: number;
    status: AttendanceStatus;
    note?: string;
  };
  if (!studentId || !sessionId || !status)
    return res.status(400).json({ message: 'studentId, sessionId, status は必須です' });
  try {
    const record = await upsertAttendance({ studentId, sessionId, status, note });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: '出欠登録に失敗しました', error: `${error}` });
  }
});

app.get('/reports/summary', async (_req, res) => {
  try {
    const summary = await attendanceSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: '集計の取得に失敗しました', error: `${error}` });
  }
});

export default app;
