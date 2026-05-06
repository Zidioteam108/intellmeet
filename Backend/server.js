require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {

});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('IntellMeet backend is running');
});

app.get('/health', (req, res) => {


app.use('/api/auth', authRoutes);

// Socket.io
io.on('connection', (socket) => {


// Error handling
app.use((err, req, res, next) => {


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

startServer();

