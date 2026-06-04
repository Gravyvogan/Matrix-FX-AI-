const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pair: {
    type: String,
    required: true,
    trim: true,
    uppercase: true // e.g., 'EURUSD', 'GBPUSD'
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    required: true // Lot sizes or unit values
  },
  stopLoss: {
    type: Number,
    default: null
  },
  takeProfit: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'PENDING'],
    default: 'OPEN'
  },
  profit: {
    type: Number,
    default: 0 // Absolute profit/loss in USD amount
  },
  profitPercentage: {
    type: Number,
    default: 0
  },
  aiSignalStrength: {
    type: String,
    default: "N/A" // Logs indicator context when trade was opened
  },
  technicalIndicators: {
    rsi: Number,
    macd: String,
    bollingerBands: String
  }
}, {
  timestamps: true // Tracks open times and close times automatically
});

module.exports = mongoose.model('Trade', TradeSchema);
