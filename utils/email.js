const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email
exports.sendOTPEmail = async (toEmail, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#6366f1;margin-top:0;">🚀 TeamBase Pro</h2>
      <h3 style="color:#0f172a;">Password Reset OTP</h3>
      <p style="color:#374151;">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151;">Your OTP to reset your password is:</p>
      <div style="background:#f1f5f9;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
        <span style="font-size:36px;font-weight:800;color:#6366f1;letter-spacing:8px;">${otp}</span>
      </div>
      <p style="color:#64748b;font-size:13px;">⏰ This OTP expires in <strong>10 minutes</strong>.</p>
      <p style="color:#64748b;font-size:13px;">If you did not request this, please ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
      <p style="color:#94a3b8;font-size:12px;">TeamBase Pro · IT Company Management System</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"TeamBase Pro" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Password Reset OTP — TeamBase Pro",
    html,
  });
};

// Send welcome email to new user
exports.sendWelcomeEmail = async (toEmail, name, password, teamName) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#6366f1;margin-top:0;">🚀 Welcome to TeamBase Pro!</h2>
      <p style="color:#374151;">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151;">Your account has been created. Here are your login details:</p>
      <div style="background:#f1f5f9;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:6px 0;color:#374151;"><strong>Email:</strong> ${toEmail}</p>
        <p style="margin:6px 0;color:#374151;"><strong>Password:</strong> ${password}</p>
        <p style="margin:6px 0;color:#374151;"><strong>Team:</strong> ${teamName}</p>
      </div>
      <p style="color:#ef4444;font-size:13px;">⚠️ Please change your password after first login.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
      <p style="color:#94a3b8;font-size:12px;">TeamBase Pro · IT Company Management System</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"TeamBase Pro" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to TeamBase Pro — Your Login Details",
    html,
  });
};
