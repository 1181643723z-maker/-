import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { cwd } from 'node:process';

const port = Number(process.env.PORT || 8000);
const root = cwd();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safePath(urlPath) {
  const normalized = normalize(decodeURIComponent(urlPath)).replace(/^([.][.][/\\])+/, '');
  return join(root, normalized);
}

function sendFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;

  const targetPath = safePath(pathname);

  if (existsSync(targetPath) && statSync(targetPath).isFile()) {
    sendFile(res, targetPath);
    return;
  }

  // Fallback to index for accidental deep-link access to avoid "Not Found".
  const indexPath = join(root, 'index.html');
  if (existsSync(indexPath)) {
    sendFile(res, indexPath);
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not Found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Snake game server is running on http://0.0.0.0:${port}`);
});
