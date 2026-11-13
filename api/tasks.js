/**
 * 任务接口  /api/tasks
 * ------------------------------------------------------------
 * 一个文件同时支持 4 种操作，靠请求方法区分：
 *   GET    /api/tasks            查询全部任务
 *   POST   /api/tasks            新增任务
 *   PATCH  /api/tasks?id=xxx     修改任务（含切换完成状态）
 *   DELETE /api/tasks?id=xxx     删除任务
 *
 * 这份代码在两种环境下都能跑：
 *   - 本地：由 vite.config.js 里的中间件调用
 *   - 线上：Vercel 会把它当成 Serverless Function 自动部署
 */

import {
  createTask,
  deleteTask,
  listTasks,
  storageMode,
  updateTask,
} from './_db.js';

const PRIORITIES = ['high', 'medium', 'low'];

/* ---------- 工具函数：兼容两种运行环境 ---------- */

/** 取查询参数（Vercel 已解析好 req.query，本地需要自己解析） */
function getQuery(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  const url = new URL(req.url || '/', 'http://localhost');
  return Object.fromEntries(url.searchParams.entries());
}

/** 读取请求体（Vercel 已解析好 req.body，本地需要自己读流） */
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

/** 校验并整理前端传来的字段 */
function normalizeInput(body) {
  const title = String(body.title ?? '').trim();
  if (!title) throw new Error('任务标题不能为空');
  if (title.length > 255) throw new Error('任务标题不能超过 255 个字符');

  const priority = body.priority ?? 'medium';
  if (!PRIORITIES.includes(priority)) {
    throw new Error('优先级只能是 high、medium 或 low');
  }

  let dueDate = body.dueDate ?? null;
  if (dueDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      throw new Error('截止日期格式应为 YYYY-MM-DD');
    }
  } else {
    dueDate = null;
  }

  return { title, priority, dueDate };
}

/* ---------- 主入口 ---------- */
export default async function handler(req, res) {
  try {
    const method = (req.method || 'GET').toUpperCase();
    const query = getQuery(req);

    if (method === 'GET') {
      const items = await listTasks();
      return json(res, 200, { items, mode: storageMode() });
    }

    if (method === 'POST') {
      const body = await readBody(req);
      const input = normalizeInput(body);
      const task = await createTask(input);
      return json(res, 201, task);
    }

    if (method === 'PATCH') {
      const body = await readBody(req);
      const id = String(query.id || body.id || '');
      if (!id) throw new Error('缺少任务 id');

      const patch = {};
      if (body.title !== undefined) {
        const t = String(body.title).trim();
        if (!t) throw new Error('任务标题不能为空');
        patch.title = t;
      }
      if (body.priority !== undefined) {
        if (!PRIORITIES.includes(body.priority)) {
          throw new Error('优先级只能是 high、medium 或 low');
        }
        patch.priority = body.priority;
      }
      if (body.completed !== undefined) patch.completed = Boolean(body.completed);
      if (body.dueDate !== undefined) patch.dueDate = body.dueDate || null;

      const task = await updateTask(id, patch);
      return json(res, 200, task);
    }

    if (method === 'DELETE') {
      const id = String(query.id || '');
      if (!id) throw new Error('缺少任务 id');
      await deleteTask(id);
      return json(res, 200, { ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return json(res, 405, { error: '不支持的请求方法' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器内部错误';
    const isClientError =
      message.includes('不能为空') ||
      message.includes('不能超过') ||
      message.includes('优先级只能') ||
      message.includes('格式应为') ||
      message.includes('缺少任务') ||
      message.includes('没有需要修改');

    return json(res, isClientError ? 400 : 500, { error: message });
  }
}
