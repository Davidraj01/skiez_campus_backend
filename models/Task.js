const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  description:{ type: String, default: "" },
  teamId:     { type: String, required: true },
  assignee:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status:     { type: String, enum: ["todo","inprogress","done"], default: "todo" },
  priority:   { type: String, enum: ["urgent","high","medium","low"], default: "medium" },
  due:        { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
