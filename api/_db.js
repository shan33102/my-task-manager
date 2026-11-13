/**
 * 数据访问层
 * ------------------------------------------------------------
 * 这里统一封装"任务"的增删改查，上层接口（api/tasks.js）不用关心
 * 数据到底存在哪里。
 *
 * 优先级：
 *   1. 配置了 SUPABASE_URL + SUPABASE_KEY  -> 存入 Supabase 云端数据库（正式环境用这个）
 *   2. 没配置（只可能是本地开发）          -> 存入项目根目录 .data/tasks.json（方便你先跑起来看效果）
 *
 * 注意：第 2 种只是本地预览的临时方案。部署到 Vercel 后必须配好
 * Supabase 环境变量，否则接口会直接报错（Vercel 的文件系统是只读的）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const TABLE = 'tasks';
const LOCAL_FILE = path.join(process.cwd(), '.data', 'tasks.json');

/* ------------------------------------------------------------
 * 判断当前使用哪种存储
 * ---------------------------------------------------------- */
function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

let client = null;
function getClient() {
  const cfg = supabaseConfig();
  if (!cfg) {
    throw new Error(
      '缺少 Supabase 配置。请在 .env 或 Vercel 环境变量里设置 SUPABASE_URL 和 SUPABASE_KEY。',
    );
  }
  if (!client) {
    client = createClient(cfg.url, cfg.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/* ------------------------------------------------------------
 * 数据库行 <-> 前端对象 的字段名转换
 * 数据库用下划线（due_date / created_at），前端用驼峰，比较好写。
 * ---------------------------------------------------------- */
function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    completed: row.completed,
    dueDate: row.due_date || null,
    createdAt: row.created_at,
  };
}

/* ------------------------------------------------------------
 * 本地 JSON 文件读写（仅本地开发兜底）
 * ---------------------------------------------------------- */
function readLocal() {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return [];
    const raw = fs.readFileSync(LOCAL_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeLocal(list) {
  const dir = path.dirname(LOCAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(list, null, 2), 'utf8');
}

/* ------------------------------------------------------------
 * 对外提供的方法
 * ---------------------------------------------------------- */

/** 查询全部任务，按创建时间倒序（最新的在最前面） */
export async function listTasks() {
  if (!supabaseConfig()) {
    return readLocal().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  const { data, error } = await getClient()
    .from(TABLE)
    .select('id, title, priority, completed, due_date, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(toTask);
}

/** 新增任务 */
export async function createTask({ title, priority, dueDate }) {
  if (!supabaseConfig()) {
    const list = readLocal();
    const task = {
      id: randomUUID(),
      title,
      priority,
      completed: false,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    };
    list.push(task);
    writeLocal(list);
    return task;
  }

  const { data, error } = await getClient()
    .from(TABLE)
    .insert({
      title,
      priority,
      completed: false,
      due_date: dueDate || null,
    })
    .select('id, title, priority, completed, due_date, created_at')
    .single();

  if (error) throw new Error(error.message);
  return toTask(data);
}

/** 修改任务（改标题 / 改优先级 / 切换完成 / 改截止日期） */
export async function updateTask(id, patch) {
  const payload = {};
  if (typeof patch.title === 'string') payload.title = patch.title;
  if (typeof patch.priority === 'string') payload.priority = patch.priority;
  if (typeof patch.completed === 'boolean') payload.completed = patch.completed;
  if (patch.dueDate !== undefined) payload.due_date = patch.dueDate || null;

  if (!Object.keys(payload).length) {
    throw new Error('没有需要修改的字段');
  }

  if (!supabaseConfig()) {
    const list = readLocal();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('任务不存在');

    const next = { ...list[idx] };
    if (payload.title !== undefined) next.title = payload.title;
    if (payload.priority !== undefined) next.priority = payload.priority;
    if (payload.completed !== undefined) next.completed = payload.completed;
    if ('due_date' in payload) next.dueDate = payload.due_date;

    list[idx] = next;
    writeLocal(list);
    return next;
  }

  const { data, error } = await getClient()
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('id, title, priority, completed, due_date, created_at')
    .single();

  if (error) throw new Error(error.message);
  return toTask(data);
}

/** 删除任务 */
export async function deleteTask(id) {
  if (!supabaseConfig()) {
    const list = readLocal();
    const next = list.filter((t) => t.id !== id);
    writeLocal(next);
    return true;
  }

  const { error } = await getClient().from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/** 当前存储模式，给前端提示用 */
export function storageMode() {
  return supabaseConfig() ? 'supabase' : 'local';
}
