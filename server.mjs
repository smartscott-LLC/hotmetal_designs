/* ============================================================
   SmarTools HTML Studio — Dev Server
   Simple ESM-compatible static server with correct MIME types.
   Usage: node server.mjs
   ============================================================ */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const PORT = 3000;
const ROOT = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

const server = createServer((req, res) => {
  // Clean URL
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';

  const filePath = join(ROOT, url);

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`\n  ┌───────────────────────────────────────────┐`);
  console.log(`  │                                           │`);
  console.log(`  │   SmarTools HTML Studio                   │`);
  console.log(`  │                                           │`);
  console.log(`  │   → http://localhost:${PORT}                 │`);
  console.log(`  │                                           │`);
  console.log(`  └───────────────────────────────────────────┘\n`);
});
