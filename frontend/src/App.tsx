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

  const totalStudents = useMemo(() => students.length, [students]);
  const totalSessions = useMemo(() => sessions.length, [sessions]);
  const { presentCount, totalCount } = useMemo(() => {
    const presentTotal = summary.reduce((acc, item) => acc + item.present + item.excused, 0);
    const overallTotal = summary.reduce(
      (acc, item) => acc + item.present + item.absent + item.late + item.excused,
      0
    );
    return { presentCount: presentTotal, totalCount: overallTotal };
  }, [summary]);

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
      <header className="hero">
        <div>
          <p className="eyebrow">塾向け出欠管理</p>
          <h1>Attendance Manager</h1>
          <p className="subtitle">学生と授業を登録し、出欠をリアルタイムに記録・集計します。</p>
          <div className="hero-tags">
            <span className="pill">最新の授業状況</span>
            <span className="pill pill-ghost">ダッシュボード表示</span>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-label">登録学生</p>
            <p className="stat-value">{totalStudents}</p>
            <p className="stat-helper">名</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">授業数</p>
            <p className="stat-value">{totalSessions}</p>
            <p className="stat-helper">件</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">出席率</p>
            <p className="stat-value">
              {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
            </p>
            <p className="stat-helper">公欠を含む出席</p>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Student Hub</p>
              <h2>学生管理</h2>
              <p className="section-desc">新しい学生を登録し、連絡先を一元管理します。</p>
            </div>
            <span className="pill pill-ghost">{students.length} 名登録済み</span>
          </div>
          <StudentForm onSubmit={handleStudentCreated} />
          <ul className="list">
            {students.map((s) => (
              <li key={s.id} className="list-item">
                <div className="avatar">{s.name.slice(0, 1)}</div>
                <div className="list-texts">
                  <div className="list-title">{s.name}</div>
                  <div className="muted">{s.grade}</div>
                </div>
                {s.contact && <span className="badge">{s.contact}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Session Planner</p>
              <h2>授業管理</h2>
              <p className="section-desc">授業を登録し、出欠入力のセッションを切り替えます。</p>
            </div>
            <span className="pill pill-outline">ステータス更新</span>
          </div>
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
          <div className="panel-header">
            <div>
              <p className="eyebrow">Insight</p>
              <h2>出欠集計</h2>
              <p className="section-desc">学生ごとの出席傾向をカードで確認できます。</p>
            </div>
            <span className="pill">自動更新</span>
          </div>
          <SummaryPanel summary={summary} />
        </section>
      </main>

      {loading && <div className="loading">処理中...</div>}
    </div>
  );
}

export default App;
