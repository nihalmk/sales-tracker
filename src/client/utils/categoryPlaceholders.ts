// Generic fallback images shown for an item with no photos of its own,
// keyed by category. These are self-contained inline SVGs (data URIs), not
// hotlinked external stock photos — this app is meant to run fully
// offline (see windows-installer/), so a fallback image that depends on
// an internet connection to render would be a step backwards. Each is a
// simple colored card with a small representative icon and the category
// name, generated on the fly rather than 14 separately hand-drawn assets.
//
// Category strings here must stay in sync with
// src/server/modules/items/autoCategorize.ts's CATEGORY_RULES + the
// OTHER_CATEGORY fallback ("Others") — that's where categories actually
// get assigned, this is only concerned with how to depict them.

interface CategoryStyle {
  color: string;
  // A small SVG fragment (paths/shapes only, no outer <svg> tag) drawn in
  // white, centered around (100, 90) in a 200x200 viewBox.
  icon: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Screen Protection': {
    color: '#2563eb',
    icon: `<rect x="70" y="55" width="60" height="70" rx="8" fill="none" stroke="white" stroke-width="4"/>
      <line x1="78" y1="70" x2="122" y2="45" stroke="white" stroke-width="4" stroke-linecap="round"/>`,
  },
  'Cases & Covers': {
    color: '#7c3aed',
    icon: `<rect x="72" y="50" width="56" height="80" rx="12" fill="none" stroke="white" stroke-width="4"/>
      <circle cx="100" cy="66" r="5" fill="white"/>`,
  },
  'Chargers & Adapters': {
    color: '#f59e0b',
    icon: `<rect x="78" y="60" width="44" height="34" rx="4" fill="none" stroke="white" stroke-width="4"/>
      <line x1="90" y1="94" x2="90" y2="112" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="110" y1="94" x2="110" y2="112" stroke="white" stroke-width="4" stroke-linecap="round"/>`,
  },
  'Cables & Connectors': {
    color: '#0891b2',
    icon: `<path d="M65 70 Q100 40 100 90 Q100 140 135 110" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <circle cx="65" cy="70" r="6" fill="white"/>
      <circle cx="135" cy="110" r="6" fill="white"/>`,
  },
  'Earphones & Headphones': {
    color: '#db2777',
    icon: `<path d="M65 90 a35 35 0 0 1 70 0" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <rect x="58" y="88" width="16" height="26" rx="6" fill="white"/>
      <rect x="126" y="88" width="16" height="26" rx="6" fill="white"/>`,
  },
  'Bluetooth Speakers': {
    color: '#dc2626',
    icon: `<rect x="72" y="52" width="56" height="76" rx="10" fill="none" stroke="white" stroke-width="4"/>
      <circle cx="100" cy="76" r="10" fill="none" stroke="white" stroke-width="4"/>
      <circle cx="100" cy="106" r="6" fill="none" stroke="white" stroke-width="4"/>`,
  },
  'Power Banks': {
    color: '#16a34a',
    icon: `<rect x="75" y="55" width="50" height="70" rx="6" fill="none" stroke="white" stroke-width="4"/>
      <path d="M104 68 L88 96 L100 96 L96 112 L114 84 L102 84 Z" fill="white"/>`,
  },
  'Memory & Storage': {
    color: '#4f46e5',
    icon: `<path d="M75 55 h38 l12 12 v58 h-50 z" fill="none" stroke="white" stroke-width="4"/>
      <line x1="85" y1="55" x2="85" y2="72" stroke="white" stroke-width="4"/>
      <line x1="95" y1="55" x2="95" y2="72" stroke="white" stroke-width="4"/>`,
  },
  Batteries: {
    color: '#ca8a04',
    icon: `<rect x="70" y="65" width="52" height="50" rx="6" fill="none" stroke="white" stroke-width="4"/>
      <rect x="122" y="80" width="8" height="20" rx="2" fill="white"/>
      <rect x="80" y="75" width="14" height="30" fill="white"/>`,
  },
  'Mounts, Holders & Stands': {
    color: '#0d9488',
    icon: `<circle cx="100" cy="60" r="10" fill="none" stroke="white" stroke-width="4"/>
      <line x1="100" y1="70" x2="100" y2="105" stroke="white" stroke-width="4"/>
      <path d="M75 130 L100 105 L125 130" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>`,
  },
  'Smart Wearables': {
    color: '#9333ea',
    icon: `<rect x="82" y="70" width="36" height="36" rx="8" fill="none" stroke="white" stroke-width="4"/>
      <rect x="90" y="50" width="20" height="16" rx="3" fill="white"/>
      <rect x="90" y="106" width="20" height="16" rx="3" fill="white"/>`,
  },
  'SIM Accessories': {
    color: '#65a30d',
    icon: `<path d="M80 55 h30 l10 10 v45 h-40 z" fill="none" stroke="white" stroke-width="4"/>
      <rect x="90" y="75" width="20" height="14" rx="2" fill="white"/>`,
  },
  'Repair Parts & Tools': {
    color: '#475569',
    icon: `<path d="M70 120 L100 90" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <path d="M95 65 a14 14 0 1 0 20 20 l-6 -6 -8 2 -2 -8 z" fill="white"/>`,
  },
};

const OTHER_STYLE: CategoryStyle = {
  color: '#94a3b8',
  icon: `<rect x="72" y="65" width="56" height="50" rx="6" fill="none" stroke="white" stroke-width="4"/>
    <line x1="72" y1="85" x2="128" y2="85" stroke="white" stroke-width="4"/>`,
};

const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&apos;';
    }
  });

// Naively wraps a label onto up to 2 lines by word count — plenty for
// short category names, and this is only ever rendered at label-sized
// text, not intended to handle arbitrary long strings.
const wrapLabel = (label: string): string[] => {
  const words = label.split(' ');
  if (label.length <= 16 || words.length < 2) {
    return [label];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
};

// Returns a self-contained data: URI image for the given category, usable
// directly as an <img src>. Unrecognized/missing categories fall back to a
// neutral "Others"-styled placeholder rather than failing to render.
export const getCategoryPlaceholderImage = (category?: string): string => {
  const style = (category && CATEGORY_STYLES[category]) || OTHER_STYLE;
  const lines = wrapLabel(category || 'Others').map(escapeXml);
  const startY = lines.length > 1 ? 155 : 165;
  const text = lines
    .map(
      (line, i) =>
        `<text x="100" y="${startY + i * 16}" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="white" text-anchor="middle">${line}</text>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${style.color}"/>
    ${style.icon}
    ${text}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
