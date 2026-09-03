import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import { getSocket } from "../socket";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set());
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  const activeConversationRef = useRef(null);
  const conversationsRef = useRef([]);
  const messagesRequestIdRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    api.get("/conversations").then((res) => setConversations(res.data));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleNewMessage(message) {
      const isKnownConversation = conversationsRef.current.some(
        (c) => c.id === message.conversationId
      );

      if (!isKnownConversation) {
        // Someone messaged us for the first time in a conversation we
        // didn't initiate, so it isn't in our list yet — fetch the
        // authoritative list instead of guessing at the missing fields
        // (otherUser, etc.) client-side.
        api.get("/conversations").then((res) => setConversations(res.data));
      } else {
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === message.conversationId);
          if (idx === -1) return prev;
          const updated = {
            ...prev[idx],
            lastMessage: { text: message.text, sender: message.sender, createdAt: message.createdAt },
            lastMessageAt: message.createdAt,
          };
          const rest = prev.filter((c) => c.id !== message.conversationId);
          return [updated, ...rest];
        });
      }

      if (activeConversationRef.current?.id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    }

    function handlePresenceOnline({ userId }) {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    }

    function handlePresenceOffline({ userId }) {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }

    socket.on("message:new", handleNewMessage);
    socket.on("presence:online", handlePresenceOnline);
    socket.on("presence:offline", handlePresenceOffline);
    socket.emit("presence:sync", ({ onlineUserIds }) => {
      setOnlineUserIds(new Set(onlineUserIds));
    });

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("presence:online", handlePresenceOnline);
      socket.off("presence:offline", handlePresenceOffline);
    };
  }, []);

  async function selectConversation(conversation) {
    setActiveConversation(conversation);
    setShowSidebarOnMobile(false);
    setMessages([]);

    // Guard against an older request resolving after a newer one if the
    // user switches conversations again before the fetch completes.
    messagesRequestIdRef.current = conversation.id;
    const res = await api.get(`/conversations/${conversation.id}/messages`);
    if (messagesRequestIdRef.current === conversation.id) {
      setMessages(res.data);
    }
  }

  async function startConversation(otherUser) {
    const res = await api.post("/conversations/start", { userId: otherUser.id });
    const conversation = res.data;

    setConversations((prev) => {
      if (prev.some((c) => c.id === conversation.id)) return prev;
      return [
        { ...conversation, lastMessageAt: conversation.lastMessageAt || new Date().toISOString() },
        ...prev,
      ];
    });

    await selectConversation(conversation);
  }

  function sendMessage(text) {
    const socket = getSocket();
    if (!socket || !activeConversation) return;
    socket.emit(
      "message:send",
      { conversationId: activeConversation.id, text },
      (response) => {
        if (response?.error) {
          console.error(response.error);
        }
      }
    );
  }

  return (
    <div className={"chat-page" + (showSidebarOnMobile ? "" : " mobile-chat-active")}>
      <Sidebar
        conversations={conversations}
        activeId={activeConversation?.id}
        onSelectConversation={selectConversation}
        onStartConversation={startConversation}
        currentUsername={user.username}
        onLogout={logout}
        onlineUserIds={onlineUserIds}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        currentUserId={user.id}
        onSend={sendMessage}
        isOtherUserOnline={onlineUserIds.has(activeConversation?.otherUser?.id)}
        onBack={() => setShowSidebarOnMobile(true)}
      />
    </div>
  );
}
