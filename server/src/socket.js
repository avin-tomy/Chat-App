import { Server } from "socket.io";
import { parseCookie } from "cookie";
import mongoose from "mongoose";
import { verifyToken } from "./utils/token.js";
import { encryptText } from "./utils/crypto.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

// userId -> Set of socket ids, so presence only flips offline once every
// tab/device for that user has disconnected.
const onlineUsers = new Map();

export function initSocket(httpServer, clientUrl) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie || "";
    const parsed = parseCookie(rawCookie);
    const token = parsed.token;

    if (!token) {
      return next(new Error("Not authenticated"));
    }

    try {
      const payload = verifyToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Not authenticated"));
    }
  });

  io.on("connection", (socket) => {
    let sockets = onlineUsers.get(socket.userId);
    const wasOffline = !sockets || sockets.size === 0;
    if (!sockets) {
      sockets = new Set();
      onlineUsers.set(socket.userId, sockets);
    }
    sockets.add(socket.id);

    if (wasOffline) {
      socket.broadcast.emit("presence:online", { userId: socket.userId });
    }

    // Pulled on demand (rather than pushed at connect time) so the client
    // can request it only once its "presence:online"/"presence:offline"
    // listeners are already attached, with no risk of missing the snapshot.
    socket.on("presence:sync", (callback) => {
      callback?.({ onlineUserIds: [...onlineUsers.keys()] });
    });

    socket.on("message:send", async ({ conversationId, text }, callback) => {
      try {
        if (!mongoose.isValidObjectId(conversationId) || typeof text !== "string") {
          return callback?.({ error: "Invalid payload" });
        }

        const trimmed = text.trim();
        if (trimmed.length === 0 || trimmed.length > 2000) {
          return callback?.({ error: "Message must be 1-2000 characters" });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        });
        if (!conversation) {
          return callback?.({ error: "Conversation not found" });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text: encryptText(trimmed),
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();

        const payload = {
          id: message._id,
          conversationId,
          sender: socket.userId,
          text: trimmed,
          createdAt: message.createdAt,
        };

        const otherUserId = conversation.participants
          .find((p) => p.toString() !== socket.userId)
          ?.toString();
        const otherSockets = otherUserId && onlineUsers.get(otherUserId);

        socket.emit("message:new", payload);
        if (otherSockets && otherSockets.size > 0) {
          io.to([...otherSockets]).emit("message:new", payload);
        }

        callback?.({ message: payload });
      } catch (err) {
        callback?.({ error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(socket.userId);
      if (!userSockets) return;

      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit("presence:offline", { userId: socket.userId });
      }
    });
  });

  return io;
}
