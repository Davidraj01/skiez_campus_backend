require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("./models/User");

const SEED_USERS = [
  // ADMIN
  { name: "Admin Manager", email: process.env.ADMIN_EMAIL || "admin@company.com", password: process.env.ADMIN_PASSWORD || "Admin@123", role: "admin", designation: "CEO / Admin" },

  //MERN STACK
  { name: "Kingston",   email: "kingstonking2003@gmail.com",   password: "Pass@123", role: "member", teamId: "mern",   designation: "Team Lead/Admin/MERN Stack Developer" },
  { name: "Jaisri",    email: "jaisriarangasamy@gmail.com",   password: "Pass@123", role: "member", teamId: "mern",   designation: "MERN Stack Developer" },
  // PYTHON DEVELOPERS
  { name: "Naveen",    email: "naveenkumar0409@gmail.com",   password: "Pass@123", role: "member", teamId: "python", designation: "Python Developer" },
  { name: "Rakesh",     email: "rakeshmnm123@gmail.com",  password: "Pass@123", role: "member", teamId: "python", designation: "Python Developer" },
  {name: "ajitha", email: "ajoajitha@gmail.com", password: "Pass@123", role: "member", teamId: "python", designation: "Python Developer"},
  //Flutter Developers
  {name: "Thiru", email: "thirusakthi62@gmail.com", password: "Pass@123", role: "member", teamId: "flutter", designation: "Flutter Developer"},
  {name: "Thanigaivelan", email:"thanigaivelanselvam@gmail.com", password: "Pass@123", role: "member", teamId: "flutter", designation: "Flutter Developer"},
  // PROJECT MANAGERS
  { name: "Nalini",     email: "ssnalini2004@gmail.com",password: "Pass@123",role: "member", teamId: "pm",     designation: "Project Manager" },
  { name: "John",    email: "johnwesley1055@gmail.com",   password: "Pass@123", role: "member", teamId: "pm",     designation: "Project Manager" },
  { name: "Vishwa",     email: "vishwavarathan2020@gmail.com",   password: "Pass@123", role: "member", teamId: "pm",     designation: "Project Manager" },
  

  // DIGITAL MARKETING
  { name: "Vishal Sharma",     email: "vishalsharma55289@gmail.com",   password: "Pass@123", role: "member", teamId: "dm",     designation: "Digital Marketing" },

  // HR
  {name: "Rishwanth", email:"rish24u999@gmail.com", password:"Pass@123", role: "member", teamId: "hr", designation: "HR"},
   //Marine
   {name: "keerthika", email:"keerthikeerthika0223@gmail.com", password: "Pass@123", role: "member", teamId: "marine", designation: "Marine HR"}
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("🗑  Cleared existing users");

    // Create all users (passwords auto-hashed by pre-save hook)
    for (const u of SEED_USERS) {
      await User.create(u);
      process.stdout.write(`  ✔ ${u.name}\n`);
    }

    const total = SEED_USERS.length;
    const adminCount = SEED_USERS.filter(u => u.role === "admin").length;
    const memberCount = total - adminCount;
    console.log(`\n🎉 Seeded ${total} users (${adminCount} admin${adminCount!==1?"s":""} + ${memberCount} member${memberCount!==1?"s":""})`);
    console.log("\n📋 Default Credentials:");
    const adminEntry = SEED_USERS.find(u => u.role === "admin") || {};
    console.log(`   Admin  → ${adminEntry.email || 'admin@company.com'} / ${adminEntry.password || process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`   Members → <email> / Pass@123`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
