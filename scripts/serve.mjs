// Minimal static server for local QA. Mirrors a static host: directory index and 404.html.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg' };

function headersFrom(root) {
  const f = path.join(root, '_headers');
  if (!fs.existsSync(f)) return {};
  return Object.fromEntries(fs.readFileSync(f, 'utf8').split('\n\n')[0].split('\n').filter((l) => l.startsWith('  ')).map((l) => { const i = l.indexOf(':'); return [l.slice(2, i), l.slice(i + 1).trim()]; }));
}

export function serve(root, port = 0, api = {}) {
  const extra = headersFrom(root);
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (api[url]) { api[url](req, res, `http://127.0.0.1:${server.address().port}`); return; }
    let file = path.join(root, url);
    if (url.endsWith('/')) file = path.join(file, 'index.html');
    if (!file.startsWith(path.resolve(root)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'], ...extra });
      const nf = path.join(root, '404.html');
      res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', ...extra });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

if (process.argv[1]?.endsWith('serve.mjs')) {
  const { origin } = await serve(path.resolve(process.argv[2] || 'dist'), Number(process.argv[3] || 4321));
  console.log(`Serving at ${origin}`);
}
