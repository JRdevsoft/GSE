// // server.js
// const express = require('express');
// const path    = require('path');
// const app     = express();

// app.use(express.static(path.join(__dirname, 'www')));
// app.get('/.*/', (_req, res) =>
//   res.sendFile(path.join(__dirname, 'www', 'index.html'))
// );

// const PORT = parseInt(process.env.PORT, 10) || 3000;
// const HOST = '0.0.0.0';
// app.listen(PORT, HOST, () =>
//   console.log(`Listening on http://${HOST}:${PORT}`)
// );

// server.js
const http    = require('http');
const handler = require('serve-handler');

const PORT = parseInt(process.env.PORT, 10) || 4200;

const server = http.createServer((req, res) => {
  // Sirve la carpeta 'www' y redirige TODO a index.html (SPA)
  return handler(req, res, {
    public: 'www',
    rewrites: [
      { source: '**', destination: '/index.html' }
    ]
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

