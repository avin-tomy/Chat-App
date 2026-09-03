import { avatarColor, initials } from "../utils/format";

export default function Avatar({ username, online, size }) {
  return (
    <span className="avatar-wrap">
      <span
        className={"avatar" + (size === "sm" ? " avatar-sm" : "")}
        style={{ background: avatarColor(username || "?") }}
      >
        {initials(username || "??")}
      </span>
      {online && (
        <span className={"status-dot" + (size === "sm" ? " status-dot-sm" : "")} title="Online" />
      )}
    </span>
  );
}
