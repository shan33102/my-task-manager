-- ============================================================
-- 智能任务管理系统 · Supabase 数据表
-- 使用方法：打开 Supabase 控制台 -> 左侧 SQL Editor -> 清空编辑器 -> 粘贴全部内容 -> Run
-- 本脚本可重复执行，不会因为表已存在而报错。
-- ============================================================

-- 1. 建表
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  priority    text not null default 'medium'
              check (priority in ('high', 'medium', 'low')),
  completed   boolean not null default false,
  due_date    date,
  created_at  timestamptz not null default now()
);

-- 2. 常用索引：按创建时间倒序查询
create index if not exists tasks_created_at_idx
  on public.tasks (created_at desc);

-- 3. 开启行级安全（RLS）
alter table public.tasks enable row level security;

-- ------------------------------------------------------------
-- 4. 访问策略
-- 说明：
--   后端如果用 service_role key 连接，会绕过 RLS，下面策略可以不建；
--   后端如果用 anon / publishable key，必须有策略，否则查不到数据。
--   下面这套允许匿名读写，仅适合课程作业这种无登录场景。
--   先 drop 再 create，保证脚本可以重复执行。
-- ------------------------------------------------------------
drop policy if exists tasks_select_all on public.tasks;
drop policy if exists tasks_insert_all on public.tasks;
drop policy if exists tasks_update_all on public.tasks;
drop policy if exists tasks_delete_all on public.tasks;

create policy tasks_select_all on public.tasks for select using (true);
create policy tasks_insert_all on public.tasks for insert with check (true);
create policy tasks_update_all on public.tasks for update using (true) with check (true);
create policy tasks_delete_all on public.tasks for delete using (true);
