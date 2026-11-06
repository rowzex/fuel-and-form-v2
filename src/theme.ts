import { Easing, TextStyle, useColorScheme } from 'react-native';

/**
 * Version 2.1 design tokens: "the plate".
 *
 * Made with frontend-design, ui-ux-pro-max and emil-design-eng:
 * - One bold element: the day drawn as a plate on a deep aubergine panel. Everything else stays quiet.
 * - Colours come from the kitchen, not from a fitness template: aubergine ink, tomato for actions,
 *   and macros coloured like the food they come from (beet for protein, wheat for carbs, olive for fat).
 * - Every text colour is at least 4.5:1 on the surface it sits on, in both themes.
 */
const light = {
  bg: '#EEF0F2', // porcelain
  surface: '#FFFFFF',
  raised: '#E6E3E9', // chips, tracks, inputs
  ink: '#2A1730', // aubergine black
  muted: '#5E5266',
  line: '#E0DBE3',
  accent: '#B8321A', // tomato (white text 5.9:1)
  accentInk: '#FFFFFF',
  accentSoft: '#F8E1DB',
  hero: '#2A1730', // the plate panel
  heroInk: '#FFFFFF',
  heroMuted: '#D6C8DC',
  heroTrack: '#46304E',
  protein: '#B4235A', // beet
  carbs: '#93600F', // wheat
  fat: '#4A7424', // olive
  heroProtein: '#F27BA6',
  heroCarbs: '#F2BE5C',
  heroFat: '#A8D576',
  water: '#1F6FA8',
  waterSoft: '#DCEAF5',
  streak: '#B8321A',
  good: '#3F7D20',
  warn: '#B42318',
  warnSoft: '#FDE4E1',
};

const dark: typeof light = {
  bg: '#131015',
  surface: '#1D1820',
  raised: '#2A242E',
  ink: '#F4EEF5',
  muted: '#B5AABA',
  line: '#322B37',
  accent: '#FF7A5C',
  accentInk: '#2A0D06',
  accentSoft: '#3A1C16',
  hero: '#251B2B',
  heroInk: '#FBF6FC',
  heroMuted: '#CDBDD4',
  heroTrack: '#3D2E45',
  protein: '#F27BA6',
  carbs: '#F2BE5C',
  fat: '#A8D576',
  heroProtein: '#F27BA6',
  heroCarbs: '#F2BE5C',
  heroFat: '#A8D576',
  water: '#6CB8F0',
  waterSoft: '#16293A',
  streak: '#FF7A5C',
  good: '#A8D576',
  warn: '#FF8A7A',
  warnSoft: '#3B1714',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/**
 * Two families with clear jobs: Bricolage Grotesque for titles and every number (it has the
 * personality), Plus Jakarta Sans for reading. One family name per weight so Android renders weights.
 */
export const FONTS = {
  400: 'PlusJakartaSans_400Regular',
  500: 'PlusJakartaSans_500Medium',
  600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold',
  800: 'PlusJakartaSans_800ExtraBold',
} as const;

export const DISPLAY = {
  500: 'BricolageGrotesque_500Medium',
  700: 'BricolageGrotesque_700Bold',
  800: 'BricolageGrotesque_800ExtraBold',
} as const;

export const font = (w: keyof typeof FONTS): TextStyle => ({ fontFamily: FONTS[w] });
export const display = (w: keyof typeof DISPLAY): TextStyle => ({ fontFamily: DISPLAY[w] });

/** Type scale on a 1.25 ratio from a 16 px body. Nothing under 12 px, no all-caps labels. */
export const type = {
  display: { ...display(800), fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  title: { ...display(800), fontSize: 32, lineHeight: 36, letterSpacing: -0.6 },
  h2: { ...display(700), fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  body: { ...font(400), fontSize: 16, lineHeight: 24 },
  bodyStrong: { ...font(600), fontSize: 16, lineHeight: 22 },
  label: { ...font(600), fontSize: 14, lineHeight: 20 },
  small: { ...font(500), fontSize: 13, lineHeight: 18 },
  caption: { ...font(500), fontSize: 12, lineHeight: 16 },
  number: { ...display(800), fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

/** 4/8 spacing rhythm. Radius follows hierarchy: the plate is roundest, rows are tightest. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 22, xl: 30, pill: 999 };
/** Minimum touch target (iOS 44 pt, Android 48 dp). */
export const TOUCH = 48;
/** Motion: under 300 ms for anything the user triggers. Exits are faster than entrances. */
export const motion = { press: 140, fast: 160, base: 220, slow: 280 };
/** Strong custom curves (emil-design-eng): ease-out for entering, ease-in-out for moving. */
export const ease = {
  out: Easing.bezier(0.23, 1, 0.32, 1),
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
  drawer: Easing.bezier(0.32, 0.72, 0, 1),
};
