const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  role:       { type: String, enum: ["admin", "member"], default: "member" },
  teamId:     { type: String, enum: ["uiux","python","java","mern","pm","dm","hr","sales","flutter"], default: null },
  designation:{ type: String, default: "" },
  avatar:     { type: String, default: "" },   // initials auto-set on save
  isActive:   { type: Boolean, default: true },

  // Password Reset
  resetOTP:       { type: String, default: null },
  resetOTPExpiry: { type: Date,   default: null },

}, { timestamps: true });

// Auto-set avatar initials
userSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.avatar) {
    const parts = this.name.trim().split(" ");
    this.avatar = (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }
  next();
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetOTP;
  delete obj.resetOTPExpiry;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
