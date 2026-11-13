# 智能任务管理系统（Task Manager）

React + Node.js（Vercel Serverless）+ Supabase 的课程实训项目。

## 一、技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + Vite（纯 CSS，无第三方 UI 库） |
| 后端 | Node.js Serverless Functions（`api/` 目录） |
| 数据库 | Supabase（PostgreSQL，表 `tasks`） |
| 部署 | Vercel |

## 二、目录结构

```
my-task-manager/
├── api/                     # 后端接口（部署到 Vercel 后自动成为 Serverless Function）
│   ├── _db.js               #   数据访问层：Supabase / 本地文件两种存储
│   └── tasks.js             #   /api/tasks 的增删改查
├── src/                     # 前端源码
│   ├── App.jsx              #   主组件：拿数据、算统计、处理交互
│   ├── api.js               #   前端调用后端接口的统一封装
│   ├── constants.js         #   优先级、筛选、日期格式化等常量与方法
│   ├── styles.css           #   全局样式（蓝白卡片风格 + 响应式）
│   ├── main.jsx             #   入口
│   └── components/
│       ├── StatsPanel.jsx   #   统计区（总数/已完成/未完成/完成率）
│       ├── TaskForm.jsx     #   新增任务表单
│       ├── Toolbar.jsx      #   搜索框 + 优先级筛选
│       ├── TaskList.jsx     #   列表容器（含加载/错误/空状态）
│       ├── TaskItem.jsx     #   单条任务
│       └── icons.jsx        #   内联 SVG 图标
├── supabase/
│   └── schema.sql           # 建表语句 + RLS 策略
├── .env.example             # 环境变量模板
├── vite.config.js           # 开发时同时跑前端和后端接口
└── package.json
```

## 三、本地运行

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:5173 即可。

> 没配置 Supabase 时会进入「本地预览模式」，数据写在 `.data/tasks.json`，功能全部可用。
> 配置好环境变量后重启，会自动切换到云端数据库。

## 四、配置 Supabase

1. 打开 https://supabase.com 注册并新建一个项目（Region 选 Singapore 更快）
2. 左侧 **SQL Editor** → 粘贴 `supabase/schema.sql` 的全部内容 → **Run**
   （这一步会创建 `tasks` 表：id、title、priority、completed、due_date、created_at）
3. 左侧 **Project Settings → API**，复制两个值：
   - `Project URL`
   - `service_role` key（服务端用，不会暴露给浏览器）
4. 项目根目录复制一份 `.env.example` 改名为 `.env`，填入：

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=你的 service_role key
```

5. 重新 `npm run dev`，页面底部应显示「数据已保存到 Supabase」

## 五、部署到 Vercel

1. 把项目推到 GitHub（`git init` → `git add .` → `git commit -m "init"` → 推到远程仓库）
   - `.env` 已在 `.gitignore` 中，不会被提交，密钥不会泄露
2. Vercel → **Add New Project** → 导入这个仓库
   - Framework 会自己识别为 Vite，Build Command `npm run build`，Output `dist`
3. **Settings → Environment Variables** 添加两个：
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
4. Deploy → 部署完成后访问 `https://你的项目名.vercel.app`
5. 绑定自己的域名：**Settings → Domains → Add**，按提示在域名商处加 CNAME 解析

## 六、常见问题

**1. 页面报「fetch failed」或加载不出数据**

多半是本机网络问题，不是代码问题。判断方法：浏览器直接打开
`https://<你的项目ref>.supabase.co/rest/v1/tasks?select=*`
- 返回 `[]` 或 JSON → 网络正常，重启 `npm run dev` 即可
- 打不开 → 检查代理软件：把 `*.supabase.co` 设为直连，或临时关闭代理

**2. 部署到 Vercel 后能打开页面但列表为空**

缺少环境变量。到 Vercel → **Settings → Environment Variables** 补上
`SUPABASE_URL` 和 `SUPABASE_KEY`，然后 **Redeploy**（改环境变量不会自动重新部署）。

**3. 表建好了但读写报 401 / permission denied**

说明 RLS 策略没生效。回到 Supabase **SQL Editor** 重新执行 `supabase/schema.sql`。

## 七、接口说明

| 方法 | 地址 | 说明 |
|---|---|---|
| GET | `/api/tasks` | 查询全部任务（按创建时间倒序） |
| POST | `/api/tasks` | 新增：`{ title, priority, dueDate }` |
| PATCH | `/api/tasks?id=xxx` | 修改：`{ title?, priority?, completed?, dueDate? }` |
| DELETE | `/api/tasks?id=xxx` | 删除 |
