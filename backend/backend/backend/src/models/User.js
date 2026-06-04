const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  accountBalance: {
    type: Number,
    default: 10000 // Starts with a default mock balance of $10,000
  },
  leverage: {
    type: String,
    default: "1:100"
  },
  riskPercentage: {
    type: Number,
    default: 1.0 // Default risk parameter per trade (1%)
  },
  preferredPairs: {
    type: [String],
    default: ["EURUSD", "GBPUSD", "USDJPY"]
  }
}, {
  timestamps: true // Automatically logs account creation dates
});

module.exports = mongoose.model('User', UserSchema);
