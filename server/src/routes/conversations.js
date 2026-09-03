import { Router } from "express";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { decryptText } from "../utils/crypto.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const conversations = await Conversation.find({ participants: req.userId })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "username")
    .populate("lastMessage");

  const result = conversations.map((c) => {
    const other = c.participants.find((p) => p._id.toString() !== req.userId);
    return {
      id: c._id,
      otherUser: other ? { id: other._id, username: other.username } : null,
      lastMessage: c.lastMessage
        ? { text: decryptText(c.lastMessage.text), sender: c.lastMessage.sender, createdAt: c.lastMessage.createdAt }
        : null,
      lastMessageAt: c.lastMessageAt,
    };
  });

  res.json(result);
});

router.post("/start", requireAuth, async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  if (userId === req.userId) {
    return res.status(400).json({ message: "Cannot start a conversation with yourself" });
  }

  const otherUser = await User.findById(userId).select("username");
  if (!otherUser) {
    return res.status(404).json({ message: "User not found" });
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [req.userId, userId], $size: 2 },
  }).populate("lastMessage");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.userId, userId],
    });
  }

  res.status(201).json({
    id: conversation._id,
    otherUser: { id: otherUser._id, username: otherUser.username },
    lastMessage: conversation.lastMessage
      ? {
          text: decryptText(conversation.lastMessage.text),
          sender: conversation.lastMessage.sender,
          createdAt: conversation.lastMessage.createdAt,
        }
      : null,
    lastMessageAt: conversation.lastMessageAt,
  });
});

router.get("/:id/messages", requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid conversation id" });
  }

  const conversation = await Conversation.findOne({
    _id: id,
    participants: req.userId,
  });
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const messages = await Message.find({ conversation: id }).sort({ createdAt: 1 });

  res.json(
    messages.map((m) => ({
      id: m._id,
      sender: m.sender,
      text: decryptText(m.text),
      createdAt: m.createdAt,
    }))
  );
});

export default router;
