const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
const { generateOTP } = require("../utils/otp");


exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashed,
        otpCode: otp,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    // Send email with error handling
    try {
      await transporter.sendMail({
        from: `"Fishing Game" <${process.env.EMAIL_USER}>`,
        to: trimmedEmail,
        subject: "Your OTP Verification Code",
        text: `Your OTP code is ${otp}. It expires in 5 minutes.`
      });
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      // User is created but email failed - log and continue
      return res.status(201).json({ 
        message: "User registered but failed to send OTP. Please contact support.",
        email: trimmedEmail
      });
    }

    res.json({ message: "OTP sent to email", email: trimmedEmail });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP found. Please register again." });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.otpCode !== trimmedOtp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    await prisma.user.update({
      where: { email: trimmedEmail },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpires: null
      }
    });

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: trimmedEmail },
      select: {
        id: true,
        email: true,
        isVerified: true,
        isGuest: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (user.isGuest) {
      return res.status(400).json({ message: "Guest users don't require OTP verification" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { email: trimmedEmail },
      data: {
        otpCode: otp,
        otpExpires: otpExpires
      }
    });

    // Send email with error handling
    try {
      await transporter.sendMail({
        from: `"Fishing Game" <${process.env.EMAIL_USER}>`,
        to: trimmedEmail,
        subject: "Your New OTP Verification Code",
        text: `Your new OTP code is ${otp}. It expires in 5 minutes.`
      });
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      return res.status(500).json({ 
        message: "Failed to send OTP email. Please try again later."
      });
    }

    res.json({ 
      message: "New OTP sent to email", 
      email: trimmedEmail,
      expiresIn: "5 minutes"
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email first." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.guestLogin = async (req, res) => {
  try {
    // Create a guest user in database
    const guestUser = await prisma.user.create({
      data: {
        isGuest: true,
        gold: 0,
        points: 0,
        rodLevel: 1
      },
      select: {
        id: true,
        gold: true,
        points: true,
        rodLevel: true
      }
    });

    const token = jwt.sign(
      { 
        id: guestUser.id,
        role: "guest" 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Guest login success",
      token,
      user: guestUser
    });
  } catch (err) {
    console.error("Guest login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
