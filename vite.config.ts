import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              const apiPath = req.url.split('?')[0].replace(/^\/api/, '');
              
              const possiblePaths = [
                path.join(__dirname, 'api', `${apiPath}.ts`),
                path.join(__dirname, 'api', `${apiPath}.js`),
                path.join(__dirname, 'api', apiPath, 'index.ts'),
                path.join(__dirname, 'api', apiPath, 'index.js'),
              ];

              let foundPath = null;
              for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                  foundPath = p;
                  break;
                }
              }

              if (foundPath) {
                try {
                  const fileUrl = new URL(`file://${foundPath}`).href;
                  const module = await import(fileUrl);
                  if (module.default) {
                    // Mock VercelRequest and VercelResponse
                    const vercelReq = req as any;
                    const vercelRes = res as any;
                    
                    // Add body parsing for POST requests
                    if (req.method === 'POST' || req.method === 'PATCH') {
                      const buffers = [];
                      for await (const chunk of req) {
                        buffers.push(chunk);
                      }
                      const data = Buffer.concat(buffers).toString();
                      try {
                        vercelReq.body = JSON.parse(data);
                      } catch (e) {
                        vercelReq.body = data;
                      }
                    }

                    // Add query parsing
                    const url = new URL(req.url, `http://${req.headers.host}`);
                    vercelReq.query = Object.fromEntries(url.searchParams);

                    // Add status and json methods to res
                    vercelRes.status = (code: number) => {
                      res.statusCode = code;
                      return vercelRes;
                    };
                    vercelRes.json = (data: any) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return vercelRes;
                    };

                    await module.default(vercelReq, vercelRes);
                    return;
                  }
                } catch (err) {
                  console.error(`Error in API route ${req.url}:`, err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Internal Server Error' }));
                  return;
                }
              }
            }
            next();
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_APP_URL': JSON.stringify(env.APP_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
