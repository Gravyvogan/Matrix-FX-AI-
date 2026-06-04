const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const auth = require('../middleware/auth');

// @route   POST /api/trades
// @desc    Open a new trading position
router.post('/', auth, async (req, res) => {
  const { pair, type, entryPrice, quantity, stopLoss, takeProfit, aiSignalStrength, technicalIndicators } = req.body;

  try {
    const newTrade = new Trade({
      userId: req.user.id,
      pair,
      type,
      entryPrice,
      quantity,
      stopLoss,
      takeProfit,
      aiSignalStrength,
      technicalIndicators
    });

    const trade = await newTrade.save();
    res.status(201).json({ trade, message: 'Trade entry logged successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/trades
// @desc    Retrieve all trades for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/trades/:id
// @desc    Modify open trade management rules (e.g., updating Stop Loss or Take Profit)
router.put('/:id', auth, async (req, res) => {
  const { stopLoss, takeProfit } = req.body;

  try {
    let trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: 'Trade record not located.' });

    // Validate ownership before altering trade
    if (trade.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized management attempt.' });
    }

    trade.stopLoss = stopLoss !== undefined ? stopLoss : trade.stopLoss;
    trade.takeProfit = takeProfit !== undefined ? takeProfit : trade.takeProfit;

    await trade.save();
    res.json({ trade, message: 'Risk parameters adjusted smoothly.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/trades/:id
// @desc    Close an open trade position and calculate absolute profit results
router.delete('/:id', auth, async (req, res) => {
  const { exitPrice } = req.body;

  if (!exitPrice) {
    return res.status(400).json({ message: 'Exit market price required to close trade position.' });
  }

  try {
    let trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: 'Trade record not located.' });
    if (trade.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized management attempt.' });
    }

    trade.exitPrice = exitPrice;
    trade.status = 'CLOSED';

    // Algorithmic Forex profit calculation baseline
    // P/L = (Exit Price - Entry Price) * Units (For Buy positions)
    let priceDifference = trade.type === 'BUY' ? (exitPrice - trade.entryPrice) : (trade.entryPrice - exitPrice);
    
    trade.profit = priceDifference * trade.quantity;
    trade.profitPercentage = (trade.profit / (trade.entryPrice * trade.quantity)) * 100;

    await trade.save();
    res.json({ trade, message: 'Trade liquidated and logged cleanly.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
  
