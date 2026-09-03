export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 17L13.4 13.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M3 10.2L16.5 3.6c.7-.3 1.4.4 1.1 1.1l-4.9 12.8c-.3.8-1.4.8-1.7 0l-2.2-5.4-5.4-2.2c-.8-.3-.8-1.4 0-1.7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M7.5 17H4.8A1.8 1.8 0 013 15.2V4.8A1.8 1.8 0 014.8 3H7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12.5 13.5L17 10l-4.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 10H7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="4.5" y="9" width="11" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.8 9V6.8a3.2 3.2 0 016.4 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="12.6" r="1" fill="currentColor" />
    </svg>
  );
}

export function LogoMark(props) {
  return (
    <svg viewBox="0 0 28 28" fill="none" {...props}>
      <path
        d="M9 5L19 5A5 5 0 0124 10L24 14A5 5 0 0119 19L13 19L8 24L9 19A5 5 0 014 14L4 10A5 5 0 019 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="12" r="1" fill="currentColor" />
      <circle cx="14" cy="12" r="1" fill="currentColor" />
      <circle cx="17.5" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
