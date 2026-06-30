require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");

const authRoutes    = require("./routes/auth");
const userRoutes    = require("./routes/users");
const taskRoutes    = require("./routes/tasks");
const messageRoutes = require("./routes/messages");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Rate limiting — 100 requests per 15 minutes per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests. Please slow down." }));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error. Please try again." });
});

// ── Connect DB & Start ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error("❌ DB connection failed:", err.message); process.exit(1); });
