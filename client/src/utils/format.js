// FNV-1a: small edits to a username (e.g. "avin_tomy" vs "afin_tomy") still
// need to land on visibly different hues, which a simple polynomial hash
// mod a handful of buckets doesn't reliably give.
function fnv1aHash(seed) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const AVATAR_PALETTE = [
  "hsl(8 62% 40%)",
  "hsl(44 68% 34%)",
  "hsl(80 45% 32%)",
  "hsl(116 38% 34%)",
  "hsl(152 45% 30%)",
  "hsl(188 55% 32%)",
  "hsl(224 50% 42%)",
  "hsl(260 45% 44%)",
  "hsl(296 40% 38%)",
  "hsl(332 55% 38%)",
];

export function avatarColor(seed) {
  return AVATAR_PALETTE[fnv1aHash(seed) % AVATAR_PALETTE.length];
}

export function initials(username) {
  return username.slice(0, 2).toUpperCase();
}

export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatClockTime(dateInput) {
  return new Date(dateInput).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
