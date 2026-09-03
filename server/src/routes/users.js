import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/search", requireAuth, async (req, res) => {
  const q = (req.query.q || "").toString().trim();

  if (q.length === 0) {
    return res.json([]);
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await User.find({
    username: new RegExp(escaped, "i"),
    _id: { $ne: req.userId },
  })
    .select("username")
    .limit(20);

  res.json(users.map((u) => ({ id: u._id, username: u.username })));
});

export default router;
