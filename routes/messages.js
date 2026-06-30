const express = require("express");
const Message = require("../models/Message");
const { protect, teamAccess } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/messages/:teamId ─────────────────────────────────
router.get("/:teamId", teamAccess, async (req, res) => {
  try {
    const messages = await Message.find({ teamId: req.params.teamId })
      .populate("from", "name avatar role teamId")
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/messages ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { teamId, text } = req.body;
    if (!teamId || !text?.trim())
      return res.status(400).json({ message: "teamId and text required." });

    // members can only message their own team
    if (req.user.role !== "admin" && req.user.teamId !== teamId)
      return res.status(403).json({ message: "Access denied." });

    const msg = await Message.create({ teamId, from: req.user._id, text: text.trim() });
    const populated = await msg.populate("from", "name avatar role teamId");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
