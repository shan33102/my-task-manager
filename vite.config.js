import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tasksHandler from './api/tasks.js';

/**
 * 本地开发时把 /api/tasks 请求交给 api/tasks.js 处理，
 * 这样 `npm run dev` 就同时跑起了前端和后端，不用另外开服务。
 * 部署到 Vercel 时这段不会生效（Vercel 自己有 Serverless 运行环境）。
 */
function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/tasks')) return next();

        try {
          await tasksHandler(req, res);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: err?.message || '接口异常' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // 把 .env 里的 Supabase 配置注入到 process.env，供 api/ 下的代码读取
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), localApiPlugin()],
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
  };
});
