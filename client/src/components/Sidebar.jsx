import { useEffect, useState } from "react";
import api from "../api/client";
import { formatRelativeTime } from "../utils/format";
import { SearchIcon, LogoMark, LogoutIcon } from "./icons";
import Avatar from "./Avatar";

export default function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onStartConversation,
  currentUsername,
  onLogout,
  onlineUserIds,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/users/search", { params: { q: trimmed } });
        setResults(res.data);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  async function handlePick(user) {
    setQuery("");
    setResults([]);
    await onStartConversation(user);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark small">
          <LogoMark />
          <span className="brand-mark-text">
            <span className="brand-mark-title">Chat App</span>
            <span className="brand-mark-credit">Built by Avin</span>
          </span>
        </div>
        <div className="me-chip" title={currentUsername}>
          <Avatar username={currentUsername} size="sm" />
          <span className="me-name">{currentUsername}</span>
          <button className="icon-button" onClick={onLogout} aria-label="Log out" title="Log out">
            <LogoutIcon />
          </button>
        </div>
      </div>

      <div className="search-box">
        <div className="search-input-wrap">
          <SearchIcon className="search-icon" />
          <input
            placeholder="Find someone by username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query.trim().length > 0 && (
          <ul className="search-results">
            {searching && <li className="empty">Searching…</li>}
            {!searching && results.length === 0 && <li className="empty">No one by that name</li>}
            {!searching &&
              results.map((u) => (
                <li key={u.id} onClick={() => handlePick(u)}>
                  <Avatar username={u.username} online={onlineUserIds.has(u.id)} />
                  {u.username}
                </li>
              ))}
          </ul>
        )}
      </div>

      <ul className="conversation-list">
        {conversations.length === 0 && (
          <li className="empty">
            Search for a username above to start your first conversation.
          </li>
        )}
        {conversations.map((c) => (
          <li
            key={c.id}
            className={c.id === activeId ? "active" : ""}
            onClick={() => onSelectConversation(c)}
          >
            <Avatar username={c.otherUser?.username} />
            <span className="conversation-meta">
              <span className="conversation-top">
                <span className="username">{c.otherUser?.username}</span>
                <span className="conversation-time-status">
                  {c.lastMessageAt && (
                    <span className="timestamp">{formatRelativeTime(c.lastMessageAt)}</span>
                  )}
                  {c.otherUser && onlineUserIds.has(c.otherUser.id) && (
                    <span className="status-dot status-dot-inline" title="Online" />
                  )}
                </span>
              </span>
              <span className="preview">{c.lastMessage ? c.lastMessage.text : "Say hello"}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
