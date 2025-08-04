// testServer.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/telegraf/:secret', (req, res) => {
  console.log('Webhook hit:', req.params.secret);
  res.send('OK');
});

app.listen(port, () => {
  console.log(`✅ Test server listening on port ${port}`);
});
