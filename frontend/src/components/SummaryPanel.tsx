interface Props {
  summary: {
    studentId: number;
    studentName: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }[];
}

export function SummaryPanel({ summary }: Props) {
  return (
    <div className="summary-grid">
      {summary.map((item) => (
        <div key={item.studentId} className="summary-card">
          <div className="summary-title">{item.studentName}</div>
          <div className="summary-metrics">
            <span className="metric present">出席 {item.present}</span>
            <span className="metric late">遅刻 {item.late}</span>
            <span className="metric absent">欠席 {item.absent}</span>
            <span className="metric excused">公欠 {item.excused}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
