import * as Haptics from 'expo-haptics';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, PressableProps, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ease, motion, radius, type, useTheme } from '../theme';

const native = Platform.OS !== 'web';

/** Light haptic taps; silently does nothing where unsupported. */
export const haptic = {
  tap: () => native && Haptics.selectionAsync().catch(() => {}),
  success: () => native && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  soft: () => native && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
};

export let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled?.().then((v) => (reduceMotion = v)).catch(() => {});
AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => (reduceMotion = v));

/**
 * Fades its children in when they first appear, e.g. a food just added to a meal.
 * Used for content that answers an action, not as a decoration on every section.
 */
export function FadeIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: motion.base, delay, easing: ease.out, useNativeDriver: native }).start();
  }, [v, delay]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** A Pressable that shrinks to 0.97 while pressed (140 ms, strong ease-out), so every press feels heard. */
export function PressScale({ children, style, onPressIn, onPressOut, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (value: number) => Animated.timing(scale, { toValue: value, duration: motion.press, easing: ease.out, useNativeDriver: native }).start();
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => { to(0.97); onPressIn?.(e); }}
      onPressOut={(e) => { to(1); onPressOut?.(e); }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Pops once each time `trigger` changes, e.g. when a habit is ticked. */
export function Pop({ trigger, children }: { trigger: unknown; children: ReactNode }) {
  const s = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (reduceMotion) return;
    s.setValue(0.9); // never from 0: nothing real appears from nothing
    Animated.spring(s, { toValue: 1, useNativeDriver: native, speed: 22, bounciness: 6 }).start();
  }, [trigger, s]);
  return <Animated.View style={{ transform: [{ scale: s }] }}>{children}</Animated.View>;
}

export function TypingDots() {
  const t = useTheme();
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(d, { toValue: 1, duration: 280, easing: ease.inOut, useNativeDriver: native }),
          Animated.timing(d, { toValue: 0, duration: 280, easing: ease.inOut, useNativeDriver: native }),
          Animated.delay((2 - i) * 140),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={{ flexDirection: 'row', gap: 5, padding: 14, marginLeft: 36, alignSelf: 'flex-start', backgroundColor: t.surface, borderRadius: 18, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: t.line }} accessibilityLabel="Coach is typing">
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.muted, transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }} />
      ))}
    </View>
  );
}

// ---------- toast ----------

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState('');
  const v = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback(
    (m: string) => {
      setMsg(m);
      if (timer.current) clearTimeout(timer.current);
      // Enters with a strong ease-out, leaves faster than it came, from the same edge.
      Animated.timing(v, { toValue: 1, duration: motion.base, easing: ease.out, useNativeDriver: native }).start();
      timer.current = setTimeout(() => Animated.timing(v, { toValue: 0, duration: motion.fast, easing: ease.out, useNativeDriver: native }).start(), 2200);
    },
    [v],
  );
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', left: 16, right: 16, top: insets.top + 8, alignItems: 'center',
          opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
        }}
      >
        <View style={{ backgroundColor: t.ink, paddingVertical: 12, paddingHorizontal: 18, borderRadius: radius.pill }} accessibilityLiveRegion="polite">
          <Text style={[type.label, { color: t.bg }]}>{msg}</Text>
        </View>
      </Animated.View>
    </ToastCtx.Provider>
  );
}
