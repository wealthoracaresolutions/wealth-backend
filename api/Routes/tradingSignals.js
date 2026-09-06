const { Router } = require("express");
const TradingSignal = require("../models/tradingSignal.js");
const { verify, verifyAdmin } = require("./user/verify.js");

const tradingSignalRouter = Router();

tradingSignalRouter.get("/", verify, async (req, res) => {
  try {
    const signals = await TradingSignal.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, result: signals });
  } catch (error) {
    res.status(500).json({ success: false, result: error.message });
  }
});

tradingSignalRouter.post("/", verifyAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        result: "A title and trading image are required",
      });
    }

    const signal = await TradingSignal.create({ title, description, imageUrl });
    res.status(201).json({ success: true, result: signal });
  } catch (error) {
    res.status(500).json({ success: false, result: error.message });
  }
});

tradingSignalRouter.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const signal = await TradingSignal.findByIdAndDelete(req.params.id);
    if (!signal) {
      return res.status(404).json({ success: false, result: "Signal not found" });
    }
    res.status(200).json({ success: true, result: signal });
  } catch (error) {
    res.status(500).json({ success: false, result: error.message });
  }
});

module.exports = tradingSignalRouter;