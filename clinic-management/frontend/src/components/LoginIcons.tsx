// Small inline SVG icons for the login screen (no extra dependencies).
const base = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

export const IconUser = () => (
  <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
);
export const IconLock = () => (
  <svg {...base}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const IconEye = ({ off }: { off?: boolean }) => (
  <svg {...base}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
export const IconSignIn = () => (
  <svg {...base}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>
);
export const IconPatients = () => (
  <svg {...base}><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17 14c3 0 5 2 5 5" /></svg>
);
export const IconCalendar = () => (
  <svg {...base}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>
);
export const IconChart = () => (
  <svg {...base}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);

// Brand mark: blue/teal medical cross with a heartbeat line.
export const LogoMark = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="lgA" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1d4ed8" /><stop offset="1" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="lgB" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#14b8a6" /><stop offset="1" stopColor="#0ea5a4" />
      </linearGradient>
    </defs>
    <path d="M24 4h16v20h20v16H40v20H24V40H4V24h20z" fill="url(#lgA)" />
    <path d="M40 4h0v20h20v16H40v20H32V4z" fill="url(#lgB)" opacity="0.9" />
    <path d="M8 33h13l4-9 6 17 5-12 3 4h17" fill="none" stroke="#fff" strokeWidth="3.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
