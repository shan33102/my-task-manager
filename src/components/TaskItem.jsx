import { PRIORITY_MAP, formatDate, isOverdue } from '../constants.js';
import { CalendarIcon, CheckIcon, TrashIcon } from './icons.jsx';

/**
 * 单条任务
 * 结构：勾选框 | （标题 + 标签/日期）| 删除按钮
 * 桌面端标签和日期跟标题排在同一行；手机上自动折到标题下面一行。
 */
export default function TaskItem({ task, busy, onToggle, onDelete }) {
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const overdue = isOverdue(task);

  const itemClass = [
    'item',
    task.completed ? 'is-done' : '',
    overdue ? 'is-overdue' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClass}>
      <button
        type="button"
        className="tick"
        disabled={busy}
        aria-label={task.completed ? '标记为未完成' : '标记为完成'}
        onClick={() => onToggle(task)}
      >
        <CheckIcon />
      </button>

      <div className="item-main">
        <span className="item-title">{task.title}</span>

        <div className="item-meta">
          <span className={`tag ${priority.tagClass}`}>{priority.label}</span>

          {task.dueDate && (
            <span className={`due ${overdue ? 'is-overdue' : ''}`}>
              <CalendarIcon />
              {overdue ? '已逾期 ' : ''}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="del"
        disabled={busy}
        aria-label="删除任务"
        onClick={() => onDelete(task)}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
