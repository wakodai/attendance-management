import { useMemo } from 'react';
import { AttendanceRecord, AttendanceStatus, Student } from '../types';

interface Props {
  students: Student[];
  sessionId: number;
  attendance: AttendanceRecord[];
  onUpdate: (studentId: number, sessionId: number, status: AttendanceStatus, note?: string) => Promise<void>;
}

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: '出席' },
  { value: 'late', label: '遅刻' },
  { value: 'absent', label: '欠席' },
  { value: 'excused', label: '公欠' },
];

export function AttendanceTable({ students, sessionId, attendance, onUpdate }: Props) {
  const attendanceMap = useMemo(() => {
    const map = new Map<number, AttendanceRecord>();
    attendance.forEach((a) => map.set(a.studentId, a));
    return map;
  }, [attendance]);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>氏名</th>
          <th>ステータス</th>
          <th>メモ</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => {
          const record = attendanceMap.get(student.id);
          return (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <select
                  value={record?.status || ''}
                  onChange={(e) =>
                    onUpdate(student.id, sessionId, e.target.value as AttendanceStatus, record?.note)
                  }
                >
                  <option value="">未選択</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  value={record?.note || ''}
                  placeholder="メモ"
                  onChange={(e) => onUpdate(student.id, sessionId, record?.status || 'present', e.target.value)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
