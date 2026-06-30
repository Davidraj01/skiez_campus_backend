const express = require("express");
const User    = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
const { sendWelcomeEmail }   = require("../utils/email");

const router = express.Router();
router.use(protect); // all user routes require login

// ── GET /api/users ─── Get all users (admin) ─────────────────
router.get("/", adminOnly, async (req, res) => {
  try {
    const { teamId, role } = req.query;
    const filter = {};
    if (teamId) filter.teamId = teamId;
    if (role)   filter.role   = role;
    const users = await User.find(filter).sort({ teamId: 1, name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/team/:teamId ─── Get team members ─────────
router.get("/team/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    // members can only fetch their own team
    if (req.user.role !== "admin" && req.user.teamId !== teamId)
      return res.status(403).json({ message: "Access denied." });

    const users = await User.find({ teamId, isActive: true }).sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/users ─── Create new user (admin only) ─────────
router.post("/", adminOnly, async (req, res) => {
  try {
    const { name, email, password, role, teamId, designation } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password are required." });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already registered." });

    const user = await User.create({ name, email, password, role: role || "member", teamId, designation });

    // Send welcome email (don't fail if email fails)
    const TEAM_NAMES = { uiux:"UI/UX Design", python:"Python Developers", java:"Java Developers", mern:"MERN Stack", pm:"Project Managers", dm:"Digital Marketing", hr:"HR", sales:"Sales & Marketing" };
    try { await sendWelcomeEmail(email, name, password, TEAM_NAMES[teamId] || teamId); } catch (_) {}

    res.status(201).json({ message: "User created successfully.", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/:id ─── Update user (admin only) ──────────
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { name, email, role, teamId, designation, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, teamId, designation, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User updated.", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/:id/reset-password ─── Admin resets password
router.put("/:id/reset-password", adminOnly, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.password = newPassword;
    await user.save();
    res.json({ message: `Password reset for ${user.name}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/users/:id ─── Deactivate user (admin only) ───
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: `${user.name} deactivated.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
