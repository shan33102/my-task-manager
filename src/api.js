/**
 * 前端访问后端的统一出口
 * 所有接口请求都走这里，方便以后换地址或加请求头。
 */

const BASE = '/api/tasks';

async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `请求失败（HTTP ${res.status}）`);
  }
  return data;
}

/** 查询全部任务 */
export function fetchTasks() {
  return request(BASE);
}

/** 新增任务 */
export function createTask({ title, priority, dueDate }) {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority, dueDate: dueDate || null }),
  });
}

/** 修改任务（切换完成状态 / 改标题 / 改优先级 / 改截止日期） */
export function updateTask(id, patch) {
  return request(`${BASE}?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

/** 删除任务 */
export function deleteTask(id) {
  return request(`${BASE}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}
