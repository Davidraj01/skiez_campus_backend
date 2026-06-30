const express  = require("express");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require("../utils/email");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── POST /api/auth/login ─────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required." });

    const user = await User.findOne({ email });
    if (!user || !user.isActive)
      return res.status(401).json({ message: "Invalid credentials." });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account found with this email." });

    const otp    = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOTP       = otp;
    user.resetOTPExpiry = expiry;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(user.email, user.name, otp);
    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP. Check email config." });
  }
});

// ── POST /api/auth/verify-otp ────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP." });

    if (new Date() > user.resetOTPExpiry)
      return res.status(400).json({ message: "OTP expired. Request a new one." });

    res.json({ message: "OTP verified.", verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/reset-password ───────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({ email });
    if (!user || user.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid request." });

    if (new Date() > user.resetOTPExpiry)
      return res.status(400).json({ message: "OTP expired." });

    user.password       = newPassword;
    user.resetOTP       = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful. Please login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/change-password (logged in) ────────────────
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const ok = await user.comparePassword(currentPassword);
    if (!ok)
      return res.status(400).json({ message: "Current password is incorrect." });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters." });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
