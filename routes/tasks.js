const express = require("express");
const Task    = require("../models/Task");
const { protect, adminOnly, teamAccess } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// ── GET /api/tasks/:teamId ────────────────────────────────────
router.get("/:teamId", teamAccess, async (req, res) => {
  try {
    const tasks = await Task.find({ teamId: req.params.teamId })
      .populate("assignee", "name avatar teamId")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/tasks ─── Create task (admin only) ──────────────
router.post("/", adminOnly, async (req, res) => {
  try {
    const { title, description, teamId, assignee, priority, due } = req.body;
    if (!title || !teamId)
      return res.status(400).json({ message: "Title and teamId are required." });

    const task = await Task.create({
      title, description, teamId, assignee: assignee || null,
      priority: priority || "medium",
      due: due ? new Date(due) : null,
      createdBy: req.user._id,
    });
    const populated = await task.populate("assignee", "name avatar");
    res.status(201).json({ message: "Task created.", task: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/tasks/:id/status ─── Update status ───────────────
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    // members can only update tasks in their team
    if (req.user.role !== "admin" && req.user.teamId !== task.teamId)
      return res.status(403).json({ message: "Access denied." });

    task.status = status;
    await task.save();
    res.json({ message: "Status updated.", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/tasks/:id ─── Full update (admin only) ───────────
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { title, description, assignee, priority, status, due } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignee, priority, status, due: due ? new Date(due) : null },
      { new: true }
    ).populate("assignee", "name avatar");
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task updated.", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/tasks/:id ─── Delete task (admin only) ────────
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
