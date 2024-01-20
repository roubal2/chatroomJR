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
const zpravy = [];

// API endpoint
app.get('/api/zpravy', (req, res) => {
  res.json(zpravy);
});

// API endpoint na ziskani zprav od specifickeho uzivatele
app.get('/api/zpravy/uzivate/:uzivatelskeJmeno', (req, res) => {
  const uzivatelskeJmeno = req.params.uzivatelskeJmeno;
  const zpravyUzivatele = zpravy.filter((zprava) => zprava.uzivatelskeJmeno === uzivatelskeJmeno);
  res.json(zpravyUzivatele);
});

// API endpoint na ziskani zprav podle klicoveho slova
app.get('/api/zpravy/vyhledavani/:klicoveSlovo', (req, res) => {
  const klicoveSlovo = req.params.keyword.toLowerCase();
  const filtrovaneZpravy = zpravy.filter((zprava) =>
    zprava.text.toLowerCase().includes(klicoveSlovo)
  );
  res.json(filtrovaneZpravy);
});

// API endpoint na ziskani zprav ve specificke mistnosti
app.get('/api/zpravy/mistnost/:mistnost', (req, res) => {
  const mistnost = req.params.mistnost;
  const zpravyVMistnosti = zpravy.filter((zprava) => zprava.mistnost === mistnost);
  res.json(zpravyVMistnosti);
});

// WebSocket pripojeni
io.on('connection', (socket) => {
  console.log('Uzivatel pripojen');

  // Pripojeni do mistnosti
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  // Posilani a Prijmani zprav
  socket.on('chatMessage', (zprava) => {
    zpravy.push(zprava);
    io.to(zprava.room).emit('message', zprava);
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
