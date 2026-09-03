import { useEffect, useRef, useState } from "react";
import { formatClockTime } from "../utils/format";
import { SendIcon, LogoMark, LockIcon, BackIcon } from "./icons";
import Avatar from "./Avatar";

export default function ChatWindow({ conversation, messages, currentUserId, onSend, isOtherUserOnline, onBack }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <main className="chat-window empty-state">
        <LogoMark className="empty-mark" />
        <p className="empty-title">Nothing selected yet</p>
        <p>Pick a conversation on the left, or search for someone to start a new one.</p>
      </main>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    setText("");
  }

  const username = conversation.otherUser?.username || "";

  return (
    <main className="chat-window">
      <header className="chat-window-header">
        <button className="back-button" onClick={onBack} aria-label="Back to conversations">
          <BackIcon />
        </button>
        <Avatar username={username} online={isOtherUserOnline} size="sm" />
        <span className="chat-header-meta">
          <span className="chat-header-name">{username}</span>
          {isOtherUserOnline && <span className="chat-header-status">Online</span>}
        </span>
      </header>
      <div className="message-list">
        {messages.length === 0 && (
          <p className="thread-empty">This is the start of your conversation with {username}.</p>
        )}
        {messages.map((m, idx) => {
          const mine = m.sender === currentUserId;
          const prev = messages[idx - 1];
          const grouped = prev && prev.sender === m.sender;
          return (
            <div key={m.id} className={"message-row " + (mine ? "mine" : "theirs")}>
              <div className={"message " + (mine ? "mine" : "theirs") + (grouped ? " grouped" : "")}>
                <p>{m.text}</p>
              </div>
              <span className="message-time">{formatClockTime(m.createdAt)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form className="message-form" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${username}`}
          autoFocus
        />
        <button type="submit" className="send-button" aria-label="Send message">
          <SendIcon />
        </button>
      </form>
      <p className="encryption-note">
        <LockIcon />
        Messages are encrypted before they're stored
      </p>
    </main>
  );
}
