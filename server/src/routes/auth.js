import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/token.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Generous enough for a real user who mistypes a password a few times, tight
// enough to blunt credential-stuffing / signup-spam against a public deploy.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." },
});

router.post("/signup", authLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const normalizedUsername = username.trim();

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
    return res.status(400).json({
      message: "Username must be 3-20 characters: letters, numbers, underscores only",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = await User.findOne({
    username: new RegExp(`^${normalizedUsername}$`, "i"),
  });
  if (existing) {
    return res.status(409).json({ message: "Username is already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username: normalizedUsername, passwordHash });

  const token = signToken(user._id.toString());
  setAuthCookie(res, token);

  res.status(201).json({ id: user._id, username: user.username });
});

router.post("/login", authLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = await User.findOne({
    username: new RegExp(`^${username.trim()}$`, "i"),
  });
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = signToken(user._id.toString());
  setAuthCookie(res, token);

  res.json({ id: user._id, username: user.username });
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("username");
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ id: user._id, username: user.username });
});

export default router;
