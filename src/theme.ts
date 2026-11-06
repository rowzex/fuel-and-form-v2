import { TextStyle, useColorScheme } from 'react-native';

/**
 * Version 2 design tokens, chosen with the UI/UX Pro Max skill:
 * - Product: "Calorie & Nutrition Counter" + "Habit Tracker". Flat, vibrant, block-based; no shadows.
 * - Colour: healthy green primary, macro colours (protein blue, carbs orange, fat yellow),
 *   streak amber. Every text colour is at least 4.5:1 on its surface in both themes.
 * - Dark theme leans OLED (near-black background), as the skill suggests for fitness apps.
 */
const light = {
  bg: '#F3F6F4',
  surface: '#FFFFFF',
  raised: '#E9EFEB', // chips, tracks, inputs
  ink: '#0F172A',
  muted: '#475569',
  line: '#D9E2DD',
  accent: '#047857', // primary green (white text 5.5:1)
  accentInk: '#FFFFFF',
  accentSoft: '#D1FAE5',
  hero: '#065F46', // calorie hero block
  heroInk: '#FFFFFF',
  heroMuted: '#A7F3D0',
  heroTrack: '#04513C',
  protein: '#2563EB',
  carbs: '#EA580C',
  fat: '#CA8A04',
  water: '#0369A1',
  streak: '#D97706',
  good: '#047857',
  warn: '#B91C1C',
  warnSoft: '#FEE2E2',
};

const dark: typeof light = {
  bg: '#0A0F0D',
  surface: '#141B18',
  raised: '#1E2824',
  ink: '#F1F5F9',
  muted: '#A3B1AA',
  line: '#26332E',
  accent: '#34D399',
  accentInk: '#04261A',
  accentSoft: '#0F2E23',
  hero: '#0F2E23',
  heroInk: '#ECFDF5',
  heroMuted: '#86EFAC',
  heroTrack: '#1A4536',
  protein: '#60A5FA',
  carbs: '#FB923C',
  fat: '#FACC15',
  water: '#38BDF8',
  streak: '#FBBF24',
  good: '#34D399',
  warn: '#F87171',
  warnSoft: '#3B1414',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Plus Jakarta Sans, loaded in the root layout. One family per weight so Android renders weights correctly. */
export const FONTS = {
  400: 'PlusJakartaSans_400Regular',
  500: 'PlusJakartaSans_500Medium',
  600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold',
  800: 'PlusJakartaSans_800ExtraBold',
} as const;

export const font = (w: keyof typeof FONTS): TextStyle => ({ fontFamily: FONTS[w] });

/** Type scale: 16 px body, nothing under 12 px. */
export const type = {
  display: { ...font(800), fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  title: { ...font(800), fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  h2: { ...font(700), fontSize: 18, lineHeight: 24 },
  body: { ...font(400), fontSize: 16, lineHeight: 24 },
  bodyStrong: { ...font(600), fontSize: 16, lineHeight: 22 },
  label: { ...font(600), fontSize: 14, lineHeight: 20 },
  small: { ...font(500), fontSize: 13, lineHeight: 18 },
  caption: { ...font(500), fontSize: 12, lineHeight: 16 },
  overline: { ...font(700), fontSize: 12, lineHeight: 16, letterSpacing: 1 },
  number: { ...font(800), fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

/** 4/8 spacing rhythm and shape tokens. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };
/** Minimum touch target (iOS 44 pt, Android 48 dp). */
export const TOUCH = 48;
/** Motion: short and consistent. */
export const motion = { fast: 150, base: 220, slow: 320 };
