import { FormEvent, useState } from 'react';

interface Props {
  onSubmit: (date: string, topic: string) => Promise<void>;
}

export function SessionForm({ onSubmit }: Props) {
  const [date, setDate] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date || !topic) return;
    await onSubmit(date, topic);
    setTopic('');
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label>日付</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="field">
        <label>内容</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="数学 特訓" required />
      </div>
      <button type="submit">授業を追加</button>
    </form>
  );
}
