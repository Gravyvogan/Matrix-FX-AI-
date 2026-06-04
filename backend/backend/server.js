const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Route Import Links
const authRoutes = require('./src/routes/auth');
const tradeRoutes = require('./src/routes/trades');
const marketRoutes = require('./src/routes/market');

const app = express();
const server = http.createServer(app);

// Enable real-time communication across platforms
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware for parsing JSON data and handling security headers
app.use(cors());
app.use(express.json());

// Main Route Allocations
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/market', marketRoutes);

// Base connection status path
app.get('/', (req, res) => {
  res.json({ message: "Matrix-FX AI Backend Server is running smoothly!" });
});

// WebSocket Events for real-time market streams and AI calculations
io.on('connection', (socket) => {
  console.log(`⚡ Trader connected: ${socket.id}`);

  // Handle live price subscription updates
  socket.on('subscribe_prices', (data) => {
    console.log(`📊 Subscribed to pairs: ${JSON.stringify(data)}`);
  });

  // Handle request for generating immediate technical indicators
  socket.on('request_signal', (tradeData) => {
    socket.emit('signal_generated', {
      pair: tradeData.pair || 'EURUSD',
      signal: 'HOLD',
      strength: '50%',
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Trader disconnected: ${socket.id}`);
  });
});

// Database Connection and Server Boot Initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("⚠️ Warning: MONGO_URI missing from environment setup.");
}

mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/matrixfx')
  .then(() => {
    console.log("🚀 Connected to Matrix-FX Security Database successfully.");
    server.listen(PORT, () => {
      console.log(`📡 Secure Server active on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error: ", err.message);
  });
