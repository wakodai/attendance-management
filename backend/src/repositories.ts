import { db } from './db';
import { AttendanceRecord, AttendanceStatus, Session, Student } from './types';

export function listStudents(): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM students ORDER BY name', (err, rows) => {
      if (err) return reject(err);
      resolve(rows as Student[]);
    });
  });
}

export function createStudent(input: Omit<Student, 'id'>): Promise<Student> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO students (name, grade, contact) VALUES (?, ?, ?)');
    stmt.run(input.name, input.grade, input.contact || null, function (err) {
      stmt.finalize();
      if (err) return reject(err);
      resolve({ id: this.lastID, ...input });
    });
  });
}

export function updateStudent(id: number, input: Partial<Omit<Student, 'id'>>): Promise<Student> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE students SET name = COALESCE(?, name), grade = COALESCE(?, grade), contact = COALESCE(?, contact) WHERE id = ?',
      [input.name, input.grade, input.contact, id],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error('Student not found'));
        db.get('SELECT * FROM students WHERE id = ?', [id], (getErr, row) => {
          if (getErr) return reject(getErr);
          resolve(row as Student);
        });
      }
    );
  });
}

export function listSessions(): Promise<Session[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM sessions ORDER BY date DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows as Session[]);
    });
  });
}

export function createSession(input: Omit<Session, 'id'>): Promise<Session> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO sessions (date, topic) VALUES (?, ?)');
    stmt.run(input.date, input.topic, function (err) {
      stmt.finalize();
      if (err) return reject(err);
      resolve({ id: this.lastID, ...input });
    });
  });
}

export function listAttendance(sessionId: number): Promise<AttendanceRecord[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT a.*, s.name as studentName, sess.date as sessionDate
       FROM attendance a
       JOIN students s ON a.studentId = s.id
       JOIN sessions sess ON a.sessionId = sess.id
       WHERE a.sessionId = ?
       ORDER BY s.name`,
      [sessionId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows as AttendanceRecord[]);
      }
    );
  });
}

export function upsertAttendance(entry: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM attendance WHERE studentId = ? AND sessionId = ?',
      [entry.studentId, entry.sessionId],
      (err, row) => {
        if (err) return reject(err);
        if (row) {
          db.run(
            'UPDATE attendance SET status = ?, note = ? WHERE id = ?',
            [entry.status, entry.note, row.id],
            function (updateErr) {
              if (updateErr) return reject(updateErr);
              resolve({ id: row.id, ...entry });
            }
          );
        } else {
          const stmt = db.prepare(
            'INSERT INTO attendance (studentId, sessionId, status, note) VALUES (?, ?, ?, ?)'
          );
          stmt.run(entry.studentId, entry.sessionId, entry.status, entry.note || null, function (insertErr) {
            stmt.finalize();
            if (insertErr) return reject(insertErr);
            resolve({ id: this.lastID, ...entry });
          });
        }
      }
    );
  });
}

export function attendanceSummary(): Promise<{
  studentId: number;
  studentName: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}>[] {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT s.id as studentId, s.name as studentName,
              SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
              SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
              SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late,
              SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused
       FROM students s
       LEFT JOIN attendance a ON s.id = a.studentId
       GROUP BY s.id, s.name
       ORDER BY s.name`,
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows as any);
      }
    );
  });
}

export function clearAll(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM attendance');
      db.run('DELETE FROM students');
      db.run('DELETE FROM sessions', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}
