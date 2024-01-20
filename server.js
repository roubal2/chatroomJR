const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Nacte soubory
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Pametovy sklad na zpravy
const messages = [];

// API endpoint
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// API endpoint na ziskani zprav od specifickeho uzivatele
app.get('/api/messages/user/:username', (req, res) => {
  const username = req.params.username;
  const userMessages = messages.filter((message) => message.username === username);
  res.json(userMessages);
});

// API endpoint na ziskani zprav podle klicoveho slova
app.get('/api/messages/search/:keyword', (req, res) => {
  const keyword = req.params.keyword.toLowerCase();
  const filteredMessages = messages.filter((message) =>
    message.text.toLowerCase().includes(keyword)
  );
  res.json(filteredMessages);
});

// API endpoint na ziskani zprav ve specificke mistnosti
app.get('/api/messages/room/:room', (req, res) => {
  const room = req.params.room;
  const roomMessages = messages.filter((message) => message.room === room);
  res.json(roomMessages);
});

// WebSocket pripojeni
io.on('connection', (socket) => {
  console.log('Uzivatel pripojen');

  // Pripojeni do mistnosti
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  // Posilani a Prijmani zprav
  socket.on('chatMessage', (message) => {
    messages.push(message);
    io.to(message.room).emit('message', message);
  });

  // Pripojeni Uzivatele
  socket.on('disconnect', () => {
    console.log('Uzivatel odpojen');
  });
});

// Zapnuti serveru
server.listen(PORT, () => {
  console.log(`Server bezi na http://localhost:${PORT}`);
});
