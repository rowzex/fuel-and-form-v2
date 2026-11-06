import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import {
  Animated, Keyboard, LayoutAnimation, Platform, Pressable, ScrollView, ScrollViewInstance, StyleProp, StyleSheet, Text, TextInput,
  TextInputProps, TextStyle, View, ViewInstance, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';

import { LOCALE } from '../lib/i18n';
import { dateKey, Meal, shiftKey } from '../lib/model';
import { useStore } from '../lib/store';
import { ease, radius, space, TOUCH, type, useTheme } from '../theme';
import { PressScale, reduceMotion } from './motion';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** One icon family (Ionicons) everywhere: outline by default, filled for the selected state. */
export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  return <Ionicons name={name} size={size} color={color} accessibilityElementsHidden importantForAccessibility="no" />;
}

export const MEAL_ICON: Record<Meal, IconName> = { Breakfast: 'sunny-outline', Lunch: 'fast-food-outline', Dinner: 'moon-outline', Snack: 'nutrition-outline' };

/** Strips the "›" some translated link labels end with; v2 draws a chevron icon instead. */
export const plain = (s: string) => s.replace(/\s*›\s*$/, '');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Animates toward `value` whenever it changes. */
function useTween(value: number, duration = 600, from?: number) {
  const v = useRef(new Animated.Value(reduceMotion || from === undefined ? value : from)).current;
  useEffect(() => {
    if (reduceMotion) { v.setValue(value); return; }
    Animated.timing(v, { toValue: value, duration, easing: ease.out, useNativeDriver: false }).start();
  }, [value, v, duration]);
  return v;
}

/**
 * How much of `ref`'s view the keyboard covers. Measured against the keyboard's top edge,
 * so it works whether or not the phone also resizes the window (Android edge-to-edge doesn't).
 */
function useKeyboardInset(ref: RefObject<ViewInstance | null>, onShown?: (keyboardTop: number) => void) {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      const top = e.endCoordinates.screenY;
      ref.current?.measureInWindow((_x, y, _w, h) => {
        if (ios) LayoutAnimation.configureNext(LayoutAnimation.create(e.duration || 250, 'keyboard', 'opacity'));
        setInset(Math.max(0, Math.round(y + h - top)));
        setTimeout(() => onShown?.(top), ios ? (e.duration || 250) + 30 : 60);
      });
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', (e) => {
      if (ios) LayoutAnimation.configureNext(LayoutAnimation.create(e.duration || 250, 'keyboard', 'opacity'));
      setInset(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, [ref, onShown]);
  return inset;
}

/** Page wrapper. Keeps the focused text box above the phone keyboard. */
export function Screen({ children, scroll = true, onKeyboard }: { children: ReactNode; scroll?: boolean; onKeyboard?: () => void }) {
  const t = useTheme();
  const box = useRef<ViewInstance>(null);
  const scroller = useRef<ScrollViewInstance>(null);
  const offset = useRef(0);
  const shown = useRef((keyboardTop: number) => {
    onKeyboard?.();
    // Scroll the focused field into view if it is still under the keyboard.
    const input = TextInput.State.currentlyFocusedInput?.();
    if (!input || !scroller.current) return;
    input.measureInWindow((_x, y, _w, h) => {
      const hidden = y + h + 12 - keyboardTop;
      if (hidden > 0) scroller.current?.scrollTo({ y: offset.current + hidden, animated: true });
    });
  }).current;
  const inset = useKeyboardInset(box, shown);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'left', 'right']}>
      <View ref={box} style={{ flex: 1, paddingBottom: inset }}>
        {scroll ? (
          <ScrollView
            ref={scroller} contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
            onScroll={(e) => { offset.current = e.nativeEvent.contentOffset.y; }} scrollEventThrottle={32}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.screen, { flex: 1, paddingBottom: space.md }]}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

/** Screen title row: a small line above, a large title, and actions on the right. */
export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.rowBetween, { gap: space.md, paddingTop: space.sm }]}>
      <View style={{ flex: 1, gap: 2 }}>
        {subtitle ? <Text style={[type.small, { color: t.muted }]}>{subtitle}</Text> : null}
        <Text style={[type.title, { color: t.ink }]} accessibilityRole="header">{title}</Text>
      </View>
      {right ? <View style={{ flexDirection: 'row', gap: space.sm }}>{right}</View> : null}
    </View>
  );
}

export function Card({ title, right, children, style, tone }: { title?: string; right?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'plain' | 'soft' }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: tone === 'soft' ? t.raised : t.surface }, style]}>
      {title ? (
        <View style={[styles.rowBetween, { gap: space.sm }]}>
          <Text style={[type.h2, { color: t.ink, flexShrink: 1 }]} accessibilityRole="header">{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({ label, onPress, kind = 'primary', small, disabled, icon, style }: {
  label: string; onPress: () => void; kind?: ButtonKind; small?: boolean; disabled?: boolean; icon?: IconName; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = { primary: t.accent, secondary: t.raised, ghost: 'transparent', danger: t.warnSoft }[kind];
  const fg = { primary: t.accentInk, secondary: t.ink, ghost: t.accent, danger: t.warn }[kind];
  return (
    <PressScale
      accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
      onPress={() => { onPress(); }} disabled={disabled} hitSlop={small ? 6 : 0}
      style={[styles.btn, small && styles.btnSmall, { backgroundColor: bg, opacity: disabled ? 0.45 : 1 }, style]}
    >
      {icon ? <Icon name={icon} size={small ? 16 : 20} color={fg} /> : null}
      <Text style={[small ? type.label : type.bodyStrong, { color: fg }]} numberOfLines={1}>{label}</Text>
    </PressScale>
  );
}

/** Icon-only control with a 48 px touch target and a spoken label. */
export function IconButton({ icon, label, onPress, disabled, tone = 'plain' }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; tone?: 'plain' | 'filled' }) {
  const t = useTheme();
  return (
    <PressScale
      accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
      onPress={() => { onPress(); }}
      style={{
        width: TOUCH, height: TOUCH, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
        backgroundColor: tone === 'filled' ? t.accent : t.surface, borderWidth: tone === 'filled' ? 0 : 1, borderColor: t.line, opacity: disabled ? 0.35 : 1,
      }}
    >
      <Icon name={icon} size={22} color={tone === 'filled' ? t.accentInk : t.ink} />
    </PressScale>
  );
}

/** Small text link with a trailing chevron. */
export function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { onPress(); }} accessibilityRole="link" accessibilityLabel={plain(label)} hitSlop={12}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 2, opacity: pressed ? 0.6 : 1, minHeight: 32 })}
    >
      <Text style={[type.label, { color: t.accent }]}>{plain(label)}</Text>
      <Icon name="chevron-forward" size={16} color={t.accent} />
    </Pressable>
  );
}

/** Selectable pill. */
export function Chip({ label, on, onPress, icon }: { label: string; on: boolean; onPress: () => void; icon?: IconName }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => { onPress(); }} accessibilityRole="button" accessibilityState={{ selected: on }} hitSlop={4}
      style={({ pressed }) => ({
        minHeight: 40, paddingHorizontal: space.lg, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: on ? t.ink : t.surface, borderWidth: 1, borderColor: on ? t.ink : t.line, opacity: pressed ? 0.8 : 1,
      })}
    >
      {icon ? <Icon name={icon} size={16} color={on ? t.bg : t.muted} /> : null}
      <Text style={[type.label, { color: on ? t.bg : t.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[type.small, { color: t.muted }, style]}>{children}</Text>;
}

/** Text field with a visible label above it (placeholders alone are not labels). */
export function Field({ label, style, ...rest }: TextInputProps & { label: string }) {
  const t = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={[type.caption, { color: t.muted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label} placeholderTextColor={t.muted}
        {...rest}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        style={[styles.input, { color: t.ink, backgroundColor: t.raised, borderColor: focus ? t.accent : 'transparent' }, noOutline]}
      />
    </View>
  );
}

const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

/** Text box without a label row, for search and chat where an icon or button names it. */
export function Input({ icon, style, ...rest }: TextInputProps & { icon?: IconName }) {
  const t = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[styles.inputRow, { backgroundColor: t.raised, borderColor: focus ? t.accent : 'transparent' }, style]}>
      {icon ? <Icon name={icon} size={20} color={t.muted} /> : null}
      <TextInput
        placeholderTextColor={t.muted}
        {...rest}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        style={[type.body, { flex: 1, color: t.ink, paddingVertical: 12 }, noOutline]}
      />
    </View>
  );
}

/** Progress ring. `on="hero"` sets the colours for drawing on the green hero block. */
export function Ring({ value, goal, size = 176, stroke = 14, on = 'surface', color, children }: {
  value: number; goal: number; size?: number; stroke?: number; on?: 'surface' | 'hero'; color?: string; children?: ReactNode;
}) {
  const t = useTheme();
  const r = 60 - stroke / 2;
  const c = 2 * Math.PI * r;
  const over = value > goal;
  const progress = useTween(Math.min(1, goal > 0 ? value / goal : 0));
  const track = on === 'hero' ? t.heroTrack : t.raised;
  const fill = color ?? (over ? t.carbs : on === 'hero' ? t.heroInk : t.ink);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={60} cy={60} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={60} cy={60} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" stroke={fill} strokeDasharray={`${c}`}
          strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [c, 0] })}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

/** Calorie ring with the number left in the middle. */
export function CalorieRing({ value, goal, size = 176, on }: { value: number; goal: number; size?: number; on?: 'surface' | 'hero' }) {
  const t = useTheme();
  const { t: tr } = useStore();
  const left = Math.round(goal - value);
  const ink = on === 'hero' ? t.heroInk : t.ink;
  const sub = on === 'hero' ? t.heroMuted : t.muted;
  return (
    <Ring value={value} goal={goal} size={size} on={on}>
      <Text style={[type.number, { fontSize: size * 0.2, lineHeight: size * 0.24, color: ink }]}>{Math.abs(left).toLocaleString()}</Text>
      <Text style={[type.caption, { color: sub }]}>{left >= 0 ? tr('ring.left') : tr('ring.over')}</Text>
    </Ring>
  );
}

/** One macro as a horizontal bar with grams eaten / target. The fill slides (transform only, no layout work). */
export function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const p = useTween(Math.min(1, goal ? value / goal : 0), 600, 0);
  return (
    <View style={{ gap: 6 }} accessible accessibilityLabel={`${label}: ${Math.round(value)} / ${goal} g`}>
      <View style={styles.rowBetween}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
          <Text style={[type.label, { color: t.ink }]}>{label}</Text>
        </View>
        <Text style={[type.small, { color: t.muted }]}>
          <Text style={[type.label, { color: t.ink }]}>{Math.round(value)}</Text> / {goal} g
        </Text>
      </View>
      <View style={[styles.bar, { backgroundColor: t.raised }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <Animated.View
          style={{
            width: '100%', height: '100%', borderRadius: radius.pill, backgroundColor: color,
            transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: [-w, 0] }) }],
          }}
        />
      </View>
    </View>
  );
}

/**
 * The day as a plate: the outer rim fills with calories, and three inner arcs (a third of the
 * plate each) fill with protein, carbs and fat. It draws itself in once when the screen opens,
 * which is the one moment of motion that is not a response to a tap.
 */
export function Plate({ kcal, goal, p, c, f, size = 220 }: {
  kcal: number; goal: { kcal: number; p: number; c: number; f: number }; p: number; c: number; f: number; size?: number;
}) {
  const t = useTheme();
  const { t: tr } = useStore();
  const left = Math.round(goal.kcal - kcal);
  const over = left < 0;
  const rim = useTween(Math.min(1, goal.kcal > 0 ? kcal / goal.kcal : 0), 900, 0);
  const R = 54; const RW = 8; const rc = 2 * Math.PI * R;
  const r = 41; const rw = 9; const ic = 2 * Math.PI * r;
  const seg = ic / 3; const gap = 9; const arc = seg - gap;
  const macros = [
    { v: p, g: goal.p, color: t.heroProtein, label: tr('protein') },
    { v: c, g: goal.c, color: t.heroCarbs, label: tr('carbs') },
    { v: f, g: goal.f, color: t.heroFat, label: tr('fat') },
  ];
  return (
    <View
      style={{ width: size, height: size }} accessible
      accessibilityLabel={`${Math.abs(left)} kcal ${over ? tr('ring.over') : tr('ring.left')}. ${macros.map((m) => `${m.label} ${Math.round(m.v)} / ${m.g} g`).join(', ')}`}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={60} cy={60} r={R} stroke={t.heroTrack} strokeWidth={RW} fill="none" />
        <AnimatedCircle
          cx={60} cy={60} r={R} fill="none" strokeWidth={RW} strokeLinecap="round" stroke={over ? t.heroCarbs : t.heroInk}
          strokeDasharray={`${rc}`} strokeDashoffset={rim.interpolate({ inputRange: [0, 1], outputRange: [rc, 0] })}
        />
        {macros.map((m, i) => (
          <G key={m.label} rotation={i * 120 + (gap / ic) * 180} origin="60, 60">
            <Circle cx={60} cy={60} r={r} stroke={t.heroTrack} strokeWidth={rw} fill="none" strokeLinecap="round" strokeDasharray={`${arc} ${ic}`} />
            <MacroArc value={m.g ? Math.min(1, m.v / m.g) : 0} r={r} rw={rw} arc={arc} ic={ic} color={m.color} delay={i} />
          </G>
        ))}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[type.number, { fontSize: size * 0.2, lineHeight: size * 0.23, color: t.heroInk, letterSpacing: -1 }]}>{Math.abs(left).toLocaleString()}</Text>
        <Text style={[type.small, { color: t.heroMuted }]}>{over ? tr('ring.over') : tr('ring.left')}</Text>
      </View>
    </View>
  );
}

function MacroArc({ value, r, rw, arc, ic, color, delay }: { value: number; r: number; rw: number; arc: number; ic: number; color: string; delay: number }) {
  const v = useRef(new Animated.Value(reduceMotion ? value : 0)).current;
  useEffect(() => {
    if (reduceMotion) { v.setValue(value); return; }
    Animated.timing(v, { toValue: value, duration: 700, delay: 120 + delay * 60, easing: ease.out, useNativeDriver: false }).start();
  }, [value, v, delay]);
  return (
    <AnimatedCircle
      cx={60} cy={60} r={r} fill="none" strokeWidth={rw} strokeLinecap="round" stroke={color}
      strokeDasharray={v.interpolate({ inputRange: [0, 1], outputRange: [`0.001 ${ic}`, `${arc} ${ic}`] })}
    />
  );
}

/** Title with the day it shows and previous / next day buttons, shared by Today and Habits. */
export function DayHeader({ title }: { title: string }) {
  const { date, setDate, t: tr, lang } = useStore();
  const today = dateKey(new Date());
  const [y, m, d] = date.split('-').map(Number);
  const label =
    date === today ? tr('day.today') : date === shiftKey(today, -1) ? tr('day.yesterday')
      : new Date(y, m - 1, d).toLocaleDateString(LOCALE[lang ?? 'en'], { weekday: 'long', day: 'numeric', month: 'short' });
  return (
    <Header
      title={title}
      subtitle={label}
      right={
        <>
          <IconButton icon="chevron-back" label={tr('day.prev')} onPress={() => setDate(shiftKey(date, -1))} />
          <IconButton icon="chevron-forward" label={tr('day.next')} disabled={date >= today} onPress={() => setDate(shiftKey(date, 1))} />
        </>
      }
    />
  );
}

/** One chat message, used by the Coach tab and the Calendar. */
export function Bubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const t = useTheme();
  const me = role === 'user';
  return (
    <View style={{ flexDirection: 'row', gap: space.sm, alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '90%', alignItems: 'flex-end' }}>
      {!me ? (
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkles" size={15} color={t.accent} />
        </View>
      ) : null}
      <View
        style={{
          flexShrink: 1, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18,
          borderBottomRightRadius: me ? 6 : 18, borderBottomLeftRadius: me ? 18 : 6,
          backgroundColor: me ? t.accent : t.surface, borderWidth: me ? 0 : 1, borderColor: t.line,
        }}
      >
        <Text style={[type.body, { fontSize: 15, lineHeight: 22, color: me ? t.accentInk : t.ink }]}>{text}</Text>
      </View>
    </View>
  );
}

/** Empty state: icon, one line, optional action. */
export function Empty({ icon, text, action }: { icon: IconName; text: string; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.md }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.raised, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color={t.muted} />
      </View>
      <Muted style={{ textAlign: 'center' }}>{text}</Muted>
      {action}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.lg, paddingBottom: space.xxl },
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.md },
  sheet: { borderRadius: radius.lg, overflow: 'hidden' },
  btn: { minHeight: TOUCH, borderRadius: radius.md, paddingHorizontal: space.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.sm },
  btnSmall: { minHeight: 36, borderRadius: radius.pill, paddingHorizontal: 14 },
  center: { alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bar: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  input: { ...type.body, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, minHeight: TOUCH },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 14, minHeight: TOUCH },
});
