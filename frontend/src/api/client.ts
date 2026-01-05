import { AttendanceRecord, AttendanceStatus, Session, Student } from '../types';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${baseUrl}/students`);
  return res.json();
}

export async function createStudent(body: { name: string; grade: string; contact?: string }): Promise<Student> {
  const res = await fetch(`${baseUrl}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${baseUrl}/sessions`);
  return res.json();
}

export async function createSession(body: { date: string; topic: string }): Promise<Session> {
  const res = await fetch(`${baseUrl}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function fetchAttendance(sessionId: number): Promise<AttendanceRecord[]> {
  const res = await fetch(`${baseUrl}/attendance?sessionId=${sessionId}`);
  return res.json();
}

export async function saveAttendance(body: {
  studentId: number;
  sessionId: number;
  status: AttendanceStatus;
  note?: string;
}): Promise<AttendanceRecord> {
  const res = await fetch(`${baseUrl}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function fetchSummary(): Promise<{
  studentId: number;
  studentName: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}[]> {
  const res = await fetch(`${baseUrl}/reports/summary`);
  return res.json();
}
