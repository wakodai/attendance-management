export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: number;
  name: string;
  grade: string;
  contact?: string;
}

export interface Session {
  id: number;
  date: string;
  topic: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  sessionId: number;
  status: AttendanceStatus;
  note?: string;
}
