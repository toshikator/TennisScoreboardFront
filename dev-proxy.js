// Minimal CORS proxy for local development.
// Usage: npm run start-proxy
// Then keep opening your static files from your IDE or a static server at http://localhost:63342
// Frontend will detect localhost and call http://localhost:8080/players instead of the remote API.

const http = require('http');
const https = require('https');

const TARGET_HOST = 'bukhman.pro';
const TARGET_PATH = '/tennis-scoreboard-api/players';
const TARGET_PORT = 80; // http

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
}

const server = http.createServer((req, res) => {
  // Only one endpoint is supported: /players
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.url !== '/players') {
    setCors(res);
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  // Forward to target
  const options = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    path: TARGET_PATH,
    method: req.method,
    headers: Object.assign({}, req.headers, {
      host: TARGET_HOST,
      origin: undefined, // strip origin header to avoid server-side CORS logic
      referer: undefined
    })
  };

  const proxyReq = http.request(options, (proxyRes) => {
    setCors(res);
    // Copy status and headers (except overwrite CORS)
    res.statusCode = proxyRes.statusCode || 500;
    Object.keys(proxyRes.headers || {}).forEach((h) => {
      if (!/^access-control-/i.test(h)) {
        try { res.setHeader(h, proxyRes.headers[h]); } catch (e) {}
      }
    });

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    setCors(res);
    res.statusCode = 502;
    res.end('Proxy error: ' + err.message);
  });

  if (req.method === 'POST') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, () => {
  console.log('Dev CORS proxy listening on http://localhost:' + PORT + ' → http://' + TARGET_HOST + TARGET_PATH);
});
