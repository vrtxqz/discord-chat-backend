const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());

// Health check để ping giữ awake nếu cần
app.get('/health', (req, res) => {
  res.send('ok - Socket.io server alive!');
});

let users = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('userList', Object.values(users));
  });

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', {
      user: users[socket.id] || 'Anonymous',
      text: msg,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('userList', Object.values(users));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
