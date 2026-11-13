import { useEffect, useMemo, useState } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from './api.js';
import StatsPanel from './components/StatsPanel.jsx';
import TaskForm from './components/TaskForm.jsx';
import Toolbar from './components/Toolbar.jsx';
import TaskList from './components/TaskList.jsx';
import { ClipboardIcon } from './components/icons.jsx';

/**
 * 应用主组件
 * 只负责三件事：拿数据、算统计、把事件转成接口调用。
 */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [storageMode, setStorageMode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);

  const [filter, setFilter] = useState('all');
  const [keyword, setKeyword] = useState('');

  /* ---------- 读取数据 ---------- */
  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks();
      setTasks(Array.isArray(data.items) ? data.items : []);
      setStorageMode(data.mode || '');
    } catch (err) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  /* ---------- 统计 ---------- */
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return {
      total,
      done,
      todo: total - done,
      rate: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  }, [tasks]);

  /* ---------- 筛选 + 搜索 ---------- */
  const visibleTasks = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return tasks
      .filter((t) => filter === 'all' || t.priority === filter)
      .filter((t) => !kw || t.title.toLowerCase().includes(kw))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tasks, filter, keyword]);

  /* ---------- 增删改 ---------- */
  async function handleAdd(payload) {
    setBusy(true);
    setHint('');
    try {
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
      return true;
    } catch (err) {
      setHint(err.message || '添加失败');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(task) {
    setBusy(true);
    setHint('');
    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setHint(err.message || '更新失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(task) {
    setBusy(true);
    setHint('');
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setHint(err.message || '删除失败');
    } finally {
      setBusy(false);
    }
  }

  /* ---------- 页面 ---------- */
  return (
    <div className="page">
      <div className="shell">
        <main className="card">
          <header className="head">
            <div className="head-mark">
              <ClipboardIcon />
            </div>
            <h1>智能任务管理系统</h1>
            <p>记录待办、安排优先级，把清单一条条划掉</p>
          </header>

          <StatsPanel {...stats} />

          <TaskForm onAdd={handleAdd} busy={busy} />

          <Toolbar
            keyword={keyword}
            onKeywordChange={setKeyword}
            filter={filter}
            onFilterChange={setFilter}
          />

          {storageMode === 'local' && (
            <div className="notice">
              <b>本地预览模式：</b>
              还没有配置 Supabase，数据暂时保存在项目目录的
              <code> .data/tasks.json </code>
              里。配置好环境变量后会自动切换到云端数据库，详见 README。
            </div>
          )}

          {hint && <div className="notice">{hint}</div>}

          <TaskList
            tasks={visibleTasks}
            loading={loading}
            error={error}
            busy={busy}
            hasAnyTask={stats.total > 0}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />

          <div className="foot">
            <span>
              共 {stats.total} 条任务 · 已完成 {stats.done} 条
            </span>
            <span>
              {storageMode === 'supabase' ? '数据已保存到 Supabase' : '本地预览中'}
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
