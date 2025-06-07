// server.js
const express = require('express');
const path    = require('path');
const app     = express();

app.use(express.static(path.join(__dirname, 'www')));
app.get('/*', (_, res) =>
  res.sendFile(path.join(__dirname, 'www', 'index.html'))
);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () =>
  console.log(`Listening on http://${HOST}:${PORT}`)
);
