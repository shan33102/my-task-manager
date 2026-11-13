import TaskItem from './TaskItem.jsx';

/**
 * 任务列表
 * 负责三种状态：加载中 / 出错 / 空列表
 */
export default function TaskList({
  tasks,
  loading,
  error,
  busy,
  hasAnyTask,
  onToggle,
  onDelete,
}) {
  if (loading) {
    return <div className="placeholder">加载中...</div>;
  }

  if (error) {
    return <div className="placeholder placeholder--error">{error}</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="placeholder">
        {hasAnyTask ? '没有找到匹配的任务' : '还没有任务，先在上面添加一条吧'}
      </div>
    );
  }

  return (
    <div className="list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          busy={busy}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
