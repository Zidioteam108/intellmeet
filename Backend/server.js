require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./src/routes/authRoutes');
const connectDB = require('./src/config/database');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'IntellMeet API is running  ' });
});
app.use('/api/auth', authRoutes);

io.on('connection', (socket) => {
  console.log(` Connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(` Disconnected: ${socket.id}`));
});
app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .json({ success: false, message: err.message || 'Server Error' });
});
const startServer = async () => {
  await connectDB();
  server.listen(process.env.PORT, () => {
    console.log(` Server running on http://localhost:${process.env.PORT}`);
  });
};
startServer();
