import { FormEvent, useState } from 'react';

interface Props {
  onSubmit: (name: string, grade: string, contact?: string) => Promise<void>;
}

export function StudentForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !grade) return;
    await onSubmit(name, grade, contact || undefined);
    setName('');
    setGrade('');
    setContact('');
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label>氏名</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎" required />
      </div>
      <div className="field">
        <label>学年</label>
        <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="中3" required />
      </div>
      <div className="field">
        <label>連絡先 (任意)</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="保護者電話など" />
      </div>
      <button type="submit">学生を追加</button>
    </form>
  );
}
