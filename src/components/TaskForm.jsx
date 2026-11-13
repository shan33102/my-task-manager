import { useState } from 'react';
import { PRIORITIES } from '../constants.js';
import { PlusIcon } from './icons.jsx';

/**
 * 新增任务表单
 * 负责收集「标题 / 优先级 / 截止日期」，提交后交给父组件处理。
 */
export default function TaskForm({ onAdd, busy }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const canSubmit = title.trim().length > 0 && !busy;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const ok = await onAdd({
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
    });

    if (ok) {
      setTitle('');
      setDueDate('');
      setPriority('medium');
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <input
        className="field composer-title"
        type="text"
        placeholder="写点要完成的事，回车即可添加"
        value={title}
        maxLength={255}
        disabled={busy}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        className="field composer-priority"
        value={priority}
        aria-label="优先级"
        disabled={busy}
        onChange={(e) => setPriority(e.target.value)}
      >
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}优先级
          </option>
        ))}
      </select>

      <input
        className="field composer-date"
        type="date"
        aria-label="截止日期"
        value={dueDate}
        disabled={busy}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <button className="btn-primary" type="submit" disabled={!canSubmit}>
        <PlusIcon />
        添加任务
      </button>
    </form>
  );
}
