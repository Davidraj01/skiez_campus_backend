const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// Verify token and attach user to request
exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ message: "No token. Please login." });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password -resetOTP -resetOTPExpiry");
    if (!user || !user.isActive)
      return res.status(401).json({ message: "User not found or deactivated." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required." });
  next();
};

// Team member can only access their own team
exports.teamAccess = (req, res, next) => {
  const teamId = req.params.teamId || req.body.teamId;
  if (req.user.role === "admin") return next();          // admin sees all
  if (req.user.teamId !== teamId)
    return res.status(403).json({ message: "Access denied. You can only access your own team." });
  next();
};
