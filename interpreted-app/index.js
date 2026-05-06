const express = require('express');
const app = express();
const port = process.env.APP_PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// homepage route for browser
app.get('/', (req, res) => {
  res.send('Node app is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});