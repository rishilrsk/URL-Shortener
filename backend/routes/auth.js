import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTP } from "../utils/email.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const OTP_TTL_MS = 4 * 60 * 1000; // 4 minutes
const MAX_OTP_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cryptographically secure 6-digit code.
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const normalizeEmail = (email) => email.trim().toLowerCase();

const passwordError = (password) =>
  typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH
    ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    : null;

const issueOtp = async (user) => {
  const otp = generateOTP();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  await user.save();
  return otp;
};

// Checks the code and counts wrong guesses. After MAX_OTP_ATTEMPTS the code is
// thrown away, so a 6-digit code can't be brute-forced.
const checkOtp = async (user, otp) => {
  if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
    return "Your code has expired. Please request a new one.";
  }
  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return "Too many wrong attempts. Please request a new code.";
  }
  let ok = false;
  try {
    ok = typeof otp === "string" && (await bcrypt.compare(otp.trim(), user.otp));
  } catch {
    ok = false; // e.g. an old code stored before codes were hashed
  }
  if (!ok) {
    user.otpAttempts += 1;
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.otp = undefined;
      user.otpExpires = undefined;
    }
    await user.save();
    return "Invalid code. Please check it and try again.";
  }
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  return null;
};

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    const pwError = passwordError(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const cleanEmail = normalizeEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email: cleanEmail });
    if (user?.isVerified) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // An unverified account (e.g. the code email never arrived) can sign up again.
    if (user) {
      user.name = name.trim();
      user.password = hashedPassword;
    } else {
      user = new User({ name: name.trim(), email: cleanEmail, password: hashedPassword, isVerified: false });
    }
    const otp = await issueOtp(user);

    const sent = await sendOTP(user.email, otp, "verification");
    if (!sent) {
      return res.status(502).json({ error: "We couldn't send the verification email. Please try again in a moment." });
    }

    res.status(201).json({ message: "Account created. Please check your email for the verification code." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// Resend a verification or reset code.
router.post("/resend-otp", async (req, res) => {
  try {
    const { email, type } = req.body || {};
    if (!isNonEmptyString(email)) {
      return res.status(400).json({ error: "Email is required" });
    }
    const purpose = type === "reset" ? "reset" : "verification";
    const generic = { message: "If that account exists, a new code is on its way." };

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user || (purpose === "verification" && user.isVerified)) {
      return res.json(generic);
    }
    const otp = await issueOtp(user);
    const sent = await sendOTP(user.email, otp, purpose);
    if (!sent) {
      return res.status(502).json({ error: "We couldn't send the email. Please try again in a moment." });
    }
    res.json(generic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while sending the code" });
  }
});

// Verify OTP Route
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!isNonEmptyString(email) || !isNonEmptyString(otp)) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) {
      return res.status(400).json({ error: "Invalid code. Please check it and try again." });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: "This account is already verified. Please log in." });
    }

    const otpError = await checkOtp(user, otp);
    if (otpError) return res.status(400).json({ error: otpError });

    user.isVerified = true;
    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during verification" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isNonEmptyString(email) || typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    // Check the password before revealing whether the account is verified.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in", code: "NOT_VERIFIED" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, userId: user._id, email: user.email, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Current user, used by the frontend to check a saved token is still valid.
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email").lean();
    if (!user) return res.status(401).json({ error: "Account not found. Please log in again." });
    res.json({ email: user.email, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!isNonEmptyString(email)) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Same answer whether or not the email is registered, so accounts can't be discovered.
    const generic = { message: "If an account with that email exists, we sent a code to reset your password." };

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) return res.json(generic);

    const otp = await issueOtp(user);
    const sent = await sendOTP(user.email, otp, "reset");
    if (!sent) {
      return res.status(502).json({ error: "We couldn't send the email. Please try again in a moment." });
    }

    res.json(generic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during password reset request" });
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};

    if (!isNonEmptyString(email) || !isNonEmptyString(otp) || !newPassword) {
      return res.status(400).json({ error: "Email, code, and new password are required" });
    }
    const pwError = passwordError(newPassword);
    if (pwError) return res.status(400).json({ error: pwError });

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) {
      return res.status(400).json({ error: "Invalid code. Please check it and try again." });
    }

    const otpError = await checkOtp(user, otp);
    if (otpError) return res.status(400).json({ error: otpError });

    user.password = await bcrypt.hash(newPassword, 10);
    // Receiving the code by email proves ownership, so the account counts as verified.
    user.isVerified = true;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

export default router;
