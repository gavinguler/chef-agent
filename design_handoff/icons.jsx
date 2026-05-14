// Lucide-style line icons. Stroke 1.75, round caps, 24x24 viewbox.
const Ic = ({ d, fill = 'none', stroke = 'currentColor', size = 22, sw = 1.75, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    {d ? <path d={d}/> : children}
  </svg>
);

const Icons = {
  Home: (p) => <Ic {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></Ic>,
  Book: (p) => <Ic {...p}><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M4 17a3 3 0 0 1 3-3h11"/></Ic>,
  Calendar: (p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Ic>,
  Settings: (p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.4-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Ic>,
  Search: (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Ic>,
  Plus: (p) => <Ic {...p} sw={2}><path d="M12 5v14M5 12h14"/></Ic>,
  Chevron: (p) => <Ic {...p}><path d="M9 6l6 6-6 6"/></Ic>,
  ChevronL: (p) => <Ic {...p}><path d="M15 6l-6 6 6 6"/></Ic>,
  Bell: (p) => <Ic {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Ic>,
  Sparkle: (p) => <Ic {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></Ic>,
  Cart: (p) => <Ic {...p}><path d="M3 4h2l2.5 11a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></Ic>,
  Snowflake: (p) => <Ic {...p}><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19M9 5l3-3 3 3M15 19l-3 3-3-3M5 9l-3 3 3 3M19 15l3-3-3-3"/></Ic>,
  Clock: (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
  Flame: (p) => <Ic {...p}><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8z"/></Ic>,
  Leaf: (p) => <Ic {...p}><path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16z"/><path d="M4 20c4-4 8-8 14-13"/></Ic>,
  Drumstick: (p) => <Ic {...p}><path d="M14 4a5 5 0 0 1 6 6c0 3-3 4-5 4-1 0-1 1-2 2l-5 5-3-3 5-5c1-1 2-1 2-2 0-2 1-5 4-5z"/></Ic>,
  Bowl: (p) => <Ic {...p}><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 8c1-2 3-2 4 0M14 7c1-2 3-2 4 0"/></Ic>,
  Salad: (p) => <Ic {...p}><path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M7 9l2-2M12 8l1-3M16 9l3-2"/></Ic>,
  Fish: (p) => <Ic {...p}><path d="M3 12c4-6 12-6 16-2l4-2-2 4 2 4-4-2c-4 4-12 4-16-2z"/><circle cx="17" cy="11" r="0.6" fill="currentColor"/></Ic>,
  Pencil: (p) => <Ic {...p}><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/></Ic>,
  Check: (p) => <Ic {...p} sw={2}><path d="M5 12l5 5L20 7"/></Ic>,
  X: (p) => <Ic {...p} sw={2}><path d="M6 6l12 12M18 6L6 18"/></Ic>,
  Dot: (p) => <Ic {...p}><circle cx="12" cy="12" r="3" fill="currentColor"/></Ic>,
  Filter: (p) => <Ic {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></Ic>,
  More: (p) => <Ic {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></Ic>,
  Send: (p) => <Ic {...p}><path d="M21 3L3 11l8 3 3 8 7-19z"/></Ic>,
  ArrowR: (p) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ic>,
};

window.Icons = Icons;
