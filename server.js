const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');
const app = express();

app.use(cors());
app.use(express.raw({ type: 'application/octet-stream' }));

let screenshotData = null;
let audio = null;
app.get('/', (req, res) => {
  res.send('screen share server');
});

app.post('/screenshot', (req, res) => {
  screenshotData = req.body;
  console.log("Screenshot data received and stored.");
  res.status(200).send({ message: 'Screenshot data received and stored successfully' });
});

app.get('/screenshot', (req, res) => {
  if (screenshotData) {
    res.status(200).send(screenshotData);
    console.log("Sent screenshot data.");
  } else {
    res.status(404).send({ error: 'No screenshot data available' });
  }
});
app.post('/audio', (req, res) => {
  audio = req.body;
  console.log("audio data received and stored.");
  res.status(200).send({ message: 'audio data received and stored successfully' });
});

app.get('/audio', (req, res) => {
  if (audio) {
    res.status(200).send(audio);
    console.log("Sent audio data.");
  } else {
    res.status(404).send({ error: 'No audio data available' });
  }
});

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server,
  clientTracking: true,
  perMessageDeflate: false,
});

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  ws.on('message', (message) => {
    screenshotData = message;
    console.log("Received screenshot via WebSocket");

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    ws.close(1000, "Server closing connection");
  });

  ws.on('error', (error) => {
    console.error('WebSocket error: ', error);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`WebSocket server is running.`);
});
