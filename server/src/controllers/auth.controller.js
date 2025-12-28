const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
const { generateOTP } = require("../utils/otp");


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Validate username
    if (trimmedUsername.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }
    if (trimmedUsername.length > 20) {
      return res.status(400).json({ message: "Username must be at most 20 characters" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check existing username
    const existingUsername = await prisma.user.findUnique({ where: { username: trimmedUsername } });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Check existing email
    const existingEmail = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    await prisma.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        password: hashed,
        otpCode: otp,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    // Send email with error handling
    try {
      console.log(`Attempting to send OTP email to ${trimmedEmail}...`);
      
      const info = await transporter.sendMail({
        from: `"Fishing Game" <${process.env.EMAIL_USER}>`,
        to: trimmedEmail,
        subject: "Your OTP Verification Code",
        html: `
          <h2>Welcome to Fishing Game!</h2>
          <p>Thank you for registering.</p>
          <p><strong>Your OTP code is: <span style="font-size: 24px; color: #2563eb;">${otp}</span></strong></p>
          <p>This code expires in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
        text: `Your OTP code is ${otp}. It expires in 5 minutes.`
      });
      
      console.log(`✓ OTP email sent successfully to ${trimmedEmail}`);
      console.log(`Message ID: ${info.messageId}`);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      console.error("Email error details:", {
        code: emailErr.code,
        response: emailErr.response
      });
      
      // User is created but email failed - log and continue
      return res.status(201).json({ 
        message: "User registered but failed to send OTP. Please use /auth/resend-otp to get your verification code.",
        email: trimmedEmail,
        error: "email_send_failed"
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

    const updatedUser = await prisma.user.update({
      where: { email: trimmedEmail },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpires: null
      }
    });

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Email verified successfully",
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email
      }
    });
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
      console.log(`Attempting to resend OTP email to ${trimmedEmail}...`);
      
      const info = await transporter.sendMail({
        from: `"Fishing Game" <${process.env.EMAIL_USER}>`,
        to: trimmedEmail,
        subject: "Your New OTP Verification Code",
        html: `
          <h2>New OTP Code</h2>
          <p>You requested a new verification code.</p>
          <p><strong>Your OTP code is: <span style="font-size: 24px; color: #2563eb;">${otp}</span></strong></p>
          <p>This code expires in 5 minutes.</p>
          <p>If you didn't request this code, please secure your account.</p>
        `,
        text: `Your new OTP code is ${otp}. It expires in 5 minutes.`
      });
      
      console.log(`✓ OTP email sent successfully to ${trimmedEmail}`);
      console.log(`Message ID: ${info.messageId}`);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      console.error("Email error details:", {
        code: emailErr.code,
        response: emailErr.response
      });
      
      return res.status(500).json({ 
        message: "Failed to send OTP email. Please try again later.",
        error: "email_send_failed"
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
    // Generate unique guest username
    const guestNumber = Math.floor(Math.random() * 99999);
    const guestUsername = `Guest${guestNumber}`;

    // Create a guest user in database
    const guestUser = await prisma.user.create({
      data: {
        username: guestUsername,
        isGuest: true,
        gold: 0,
        points: 0,
        rodLevel: 1
      },
      select: {
        id: true,
        username: true,
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

exports.convertGuestToUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

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

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isGuest: true,
        isVerified: true,
        gold: true,
        points: true,
        rodLevel: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is actually a guest
    if (!user.isGuest) {
      return res.status(400).json({ 
        message: "User is already registered with an email" 
      });
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({ 
      where: { email: trimmedEmail } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already registered by another user" 
      });
    }

    // Hash password and generate OTP
    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log(`[DEBUG] Generated OTP for ${trimmedEmail}: ${otp}`);

    // Update guest user to regular user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: trimmedEmail,
        password: hashed,
        isGuest: false,
        isVerified: false,
        otpCode: otp,
        otpExpires: otpExpires
      },
      select: {
        id: true,
        email: true,
        gold: true,
        points: true,
        rodLevel: true,
        isVerified: true
      }
    });

    // Send verification email
    try {
      console.log(`Attempting to send OTP email to ${trimmedEmail}...`);
      
      const mailOptions = {
        from: `"Fishing Game" <${process.env.EMAIL_USER}>`,
        to: trimmedEmail,
        subject: "Verify Your Account - Fishing Game",
        html: `
          <h2>Welcome to Fishing Game!</h2>
          <p>Your guest account has been converted to a registered account.</p>
          <p><strong>Your OTP code is: <span style="font-size: 24px; color: #2563eb;">${otp}</span></strong></p>
          <p>This code expires in 5 minutes.</p>
          <hr>
          <h3>Your Current Progress:</h3>
          <ul>
            <li>Gold: ${user.gold}</li>
            <li>Points: ${user.points}</li>
            <li>Rod Level: ${user.rodLevel}</li>
          </ul>
          <p>All your progress has been saved!</p>
        `,
        text: `Welcome! Your guest account has been converted to a registered account.\n\nYour OTP code is ${otp}. It expires in 5 minutes.\n\nYour current progress:\n- Gold: ${user.gold}\n- Points: ${user.points}\n- Rod Level: ${user.rodLevel}\n\nAll your progress has been saved!`
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ OTP email sent successfully to ${trimmedEmail}`);
      console.log(`Message ID: ${info.messageId}`);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      console.error("Email error details:", {
        code: emailErr.code,
        command: emailErr.command,
        response: emailErr.response
      });
      
      // Remove debug log in production
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEBUG] OTP for ${trimmedEmail}: ${otp}`);
      }
      
      return res.status(201).json({ 
        message: "Account converted but failed to send OTP email. Please use /auth/resend-otp to get your verification code.",
        email: trimmedEmail,
        user: updatedUser,
        error: "email_send_failed"
      });
    }

    // Generate new token with email
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ 
      message: "Guest account converted successfully. Please verify your email.",
      token,
      user: updatedUser,
      email: trimmedEmail
    });
  } catch (err) {
    console.error("Convert guest to user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
