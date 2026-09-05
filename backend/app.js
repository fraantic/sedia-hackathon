import express from 'express';

const app = express();
const port = 3001;

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.listen(port, () => {
  console.log(`Backend listining on port${port}`);
});