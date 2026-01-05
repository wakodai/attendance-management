import { useEffect, useMemo, useState } from 'react';
import { AttendanceStatus, AttendanceRecord, Session, Student } from './types';
import {
  createSession,
  createStudent,
  fetchAttendance,
  fetchSessions,
  fetchStudents,
  saveAttendance,
  fetchSummary,
} from './api/client';
import { AttendanceTable } from './components/AttendanceTable';
import { StudentForm } from './components/StudentForm';
import { SessionForm } from './components/SessionForm';
import { SummaryPanel } from './components/SummaryPanel';

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSummary>>>([]);
  const [loading, setLoading] = useState(false);

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.id, label: `${s.date} - ${s.topic}` })),
    [sessions]
  );

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [studentsRes, sessionsRes, summaryRes] = await Promise.all([
        fetchStudents(),
        fetchSessions(),
        fetchSummary(),
      ]);
      setStudents(studentsRes);
      setSessions(sessionsRes);
      setSummary(summaryRes);
      if (sessionsRes.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionsRes[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (sessionId: number) => {
    setLoading(true);
    try {
      const records = await fetchAttendance(sessionId);
      setAttendance(records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      loadAttendance(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleStudentCreated = async (name: string, grade: string, contact?: string) => {
    await createStudent({ name, grade, contact });
    await loadBaseData();
  };

  const handleSessionCreated = async (date: string, topic: string) => {
    const session = await createSession({ date, topic });
    setSessions((prev) => [session, ...prev]);
    setSelectedSessionId(session.id);
  };

  const handleAttendanceChange = async (
    studentId: number,
    sessionId: number,
    status: AttendanceStatus,
    note?: string
  ) => {
    await saveAttendance({ studentId, sessionId, status, note });
    await Promise.all([loadAttendance(sessionId), loadBaseData()]);
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">塾向け出欠管理</p>
          <h1>Attendance Manager</h1>
          <p className="subtitle">学生と授業を登録し、出欠を記録・集計します。</p>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>学生管理</h2>
          <StudentForm onSubmit={handleStudentCreated} />
          <ul className="list">
            {students.map((s) => (
              <li key={s.id} className="list-item">
                <div>
                  <strong>{s.name}</strong>
                  <div className="muted">{s.grade}</div>
                </div>
                {s.contact && <span className="badge">{s.contact}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>授業管理</h2>
          <SessionForm onSubmit={handleSessionCreated} />
          <div className="select-row">
            <label htmlFor="session">表示する授業</label>
            <select
              id="session"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            >
              <option value="">選択してください</option>
              {sessionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {selectedSessionId && (
            <AttendanceTable
              students={students}
              sessionId={selectedSessionId}
              attendance={attendance}
              onUpdate={handleAttendanceChange}
            />
          )}
        </section>

        <section className="panel">
          <h2>出欠集計</h2>
          <SummaryPanel summary={summary} />
        </section>
      </main>

      {loading && <div className="loading">処理中...</div>}
    </div>
  );
}

export default App;
