/**
 * 图标组件
 * 全部用内联 SVG 手写，不依赖任何图标库，减少项目依赖。
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" {...base} width="100%" height="100%">
      <rect x="5" y="4" width="14" height="17" rx="2.2" />
      <path d="M9 4V3.2A1.2 1.2 0 0 1 10.2 2h3.6A1.2 1.2 0 0 1 15 3.2V4" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
      <path d="M9 18h3.5" />
    </svg>
  );
}

export function CheckIcon({ strokeWidth = 3.4 }) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={strokeWidth}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.9}>
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6.5 7l.8 12.1a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={1.9}>
      <rect x="4" y="5.5" width="16" height="15" rx="2.2" />
      <path d="M4 10h16" />
      <path d="M9 3.5v4" />
      <path d="M15 3.5v4" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={2.2} width="15" height="15">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
