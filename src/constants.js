/** 优先级定义：值、中文名、对应样式类 */
export const PRIORITIES = [
  { value: 'high', label: '高', tagClass: 'tag--high' },
  { value: 'medium', label: '中', tagClass: 'tag--medium' },
  { value: 'low', label: '低', tagClass: 'tag--low' },
];

export const PRIORITY_MAP = PRIORITIES.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

/** 筛选按钮 */
export const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

/** 把 2026-11-20 格式化成 11月20日 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-');
  return `${Number(month)}月${Number(day)}日`;
}

/** 今天的日期字符串（YYYY-MM-DD），用于比较是否逾期 */
export function todayString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 是否逾期：有截止日期、未完成、且日期早于今天 */
export function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  return task.dueDate < todayString();
}
