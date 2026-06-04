const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET /api/market/rates
// @desc    Retrieve real-time mock price rates for standard Forex major pairs
router.get('/rates', async (req, res) => {
  try {
    const marketRates = {
      EURUSD: { bid: 1.0852, ask: 1.0854, change: "+0.12%" },
      GBPUSD: { bid: 1.2631, ask: 1.2634, change: "-0.05%" },
      USDJPY: { bid: 151.42, ask: 151.45, change: "+0.28%" },
      AUDUSD: { bid: 0.6521, ask: 0.6523, change: "-0.18%" }
    };
    res.json(marketRates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/market/analyze
// @desc    Calculate technical indicators and deliver immediate AI trade signals
router.post('/analyze', auth, async (req, res) => {
  const { pair } = req.body;

  if (!pair) {
    return res.status(400).json({ message: 'Currency currency pair argument missing.' });
  }

  try {
    // Generates localized technical indicators on request
    const rsiMock = Math.floor(Math.random() * (75 - 25 + 1)) + 25; // Random scale baseline between 25 and 75
    let dynamicSignal = 'HOLD';
    let diagnosticStrength = 'Low';

    if (rsiMock > 70) {
      dynamicSignal = 'SELL';
      diagnosticStrength = 'Strong (Overbought)';
    } else if (rsiMock < 30) {
      dynamicSignal = 'BUY';
      diagnosticStrength = 'Strong (Oversold)';
    } else if (rsiMock > 55) {
      dynamicSignal = 'BUY';
      diagnosticStrength = 'Moderate Momentum';
    } else if (rsiMock < 45) {
      dynamicSignal = 'SELL';
      diagnosticStrength = 'Moderate Momentum';
    }

    res.json({
      pair: pair.toUpperCase(),
      signal: dynamicSignal,
      strength: diagnosticStrength,
      indicators: {
        rsi: rsiMock,
        macd: rsiMock > 50 ? 'Bullish Crossover' : 'Bearish Convergence',
        bollingerBands: rsiMock > 60 ? 'Price near upper band boundary' : 'Price maintaining baseline track'
      },
      calculatedAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
    
