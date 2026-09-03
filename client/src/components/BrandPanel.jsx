import { LogoMark } from "./icons";

export default function BrandPanel({ heading, body }) {
  return (
    <div className="brand-panel">
      <div className="brand-mark">
        <LogoMark />
        <span className="brand-mark-text">
          <span className="brand-mark-title">Chat App</span>
          <span className="brand-mark-credit">Built by Avin</span>
        </span>
      </div>
      <div className="brand-copy">
        <h2>{heading}</h2>
        <p>{body}</p>
      </div>
      <div className="brand-foot">No groups, no noise — just the people you talk to.</div>
    </div>
  );
}
