const lightColors = {
  primary: '#d10078',
  primaryLight: '#f02b9f',
  primarySoft: '#ffe0f1',
  primaryDark: '#9a0058',
  secondary: '#ff4fb3',
  pageBackground: '#fff7fc',
  surface: '#ffffff',
  surfaceMuted: '#fff0f8',
  text: '#24101d',
  textStrong: '#3b172e',
  textMuted: '#8d5a78',
  textSubtle: '#b889a5',
  textLabel: '#56233f',
  textBody: '#70445e',
  border: '#f0c9df',
  borderStrong: '#df9fc3',
  success: '#159669',
  danger: '#dc315e',
  dangerSoft: '#fff0f3',
  info: '#7b55d9',
  infoSoft: '#f1ecff',
  sky: '#c43cbd',
  skySoft: '#fce8fb',
  skyDark: '#8d258c',
  skyText: '#8d258c',
  purple: '#a83fc7',
  purpleSoft: '#f8e9ff',
  violet: '#8838b4',
  violetSoft: '#f1e7ff',
  fuchsia: '#c2188d',
  fuchsiaSoft: '#ffe5f7',
  pink: '#c2186d',
  pinkSoft: '#ffe5f2',
  indigoSoft: '#f0e9ff',
  indigoText: '#b27de8',
  slateIcon: '#e18bc1',
  emerald: '#d10078',
  indigoDeep: '#7e174f',
  green: '#159669',
  red: '#dc315e',
  amber: '#d78416',
  amberSoft: '#fff4d9',
  amberDark: '#8f5a08',
  yellow: '#e8a51a',
  redSoft: '#fff0f3',
  redDark: '#a52245',
  blueDark: '#7041bc',
  blueSoft: '#f1ecff',
  cyan: '#c43cbd',
  indigoDeepest: '#4f247e',
  purpleBright: '#c45bdd',
  purpleBrightSoft: '#f8e9ff',
  purpleDark: '#7b287f',
  purpleAccent: '#a83fc7',
  pinkSurface: '#fff0f8',
  pinkDark: '#8b174f',
  greenSoft: '#e0f8ed',
  greenDark: '#116b4e',
  emeraldDark: '#0d7d58',
  white: '#ffffff',
  black: '#000000',
} as const;

export const theme = {
  colors: Object.fromEntries(
    Object.keys(lightColors).map((name) => [name, `var(--theme-${name})`]),
  ) as { [K in keyof typeof lightColors]: `var(--theme-${K})` },
  fonts: {
    sans: 'system-ui, sans-serif',
  },
  gradients: {
    brand: 'var(--theme-gradient-brand)',
    primary: 'var(--theme-gradient-primary)',
    hero: 'var(--theme-gradient-hero)',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '20px',
    pill: '999px',
  },
} as const;

export function applyTheme(): void {
  const colors = lightColors;
  const root = document.documentElement;

  Object.entries(colors).forEach(([name, value]) => {
    root.style.setProperty(`--theme-${name}`, value);
  });
  root.style.setProperty('--text', colors.textBody);
  root.style.setProperty('--text-h', colors.textStrong);
  root.style.setProperty('--bg', colors.pageBackground);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--accent', colors.primary);
  root.style.setProperty('--accent-bg', `${colors.primary}26`);
  root.style.setProperty('--accent-border', `${colors.primary}80`);
  root.style.setProperty('--code-bg', colors.surfaceMuted);

  root.style.setProperty('--theme-gradient-brand', `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`);
  root.style.setProperty('--theme-gradient-primary', `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`);
  root.style.setProperty('--theme-gradient-hero', 'radial-gradient(circle at top left, #ffe0f1 0%, #fff7fc 100%)');
  root.dataset.theme = 'light';
  root.style.colorScheme = 'light';
}

export type AppTheme = typeof theme;

if (typeof document !== 'undefined') {
  applyTheme();
}
