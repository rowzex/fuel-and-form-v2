import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, ScrollViewInstance, Text, View } from 'react-native';

import { radius, space, type, useTheme } from '../theme';
import { haptic } from './motion';

const native = Platform.OS !== 'web';

/**
 * Settles a scroll position onto the nearest detent. Native snaps with snapToInterval; web has no
 * momentum events, so it waits for scrolling to pause and then glides the last few pixels.
 */
function useDetents(count: number, size: number, index: number, onIndex: (i: number) => void) {
  const ref = useRef<ScrollViewInstance>(null);
  const last = useRef(index);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clampI = (i: number) => Math.max(0, Math.min(count - 1, i));

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x, y } = e.nativeEvent.contentOffset;
    const pos = Math.max(x, y);
    const i = clampI(Math.round(pos / size));
    if (i !== last.current) { last.current = i; haptic.tick(); onIndex(i); }
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      if (Math.abs(pos - i * size) > 0.5) ref.current?.scrollTo({ x: x ? i * size : 0, y: y ? i * size : 0, animated: true });
    }, 140);
  };
  useEffect(() => () => { if (settle.current) clearTimeout(settle.current); }, []);
  return { ref, onScroll, last };
}

const ROW = 64;
const VISIBLE = 5;

/** A scrolling wheel of numbers. The centre row is large and coloured; rows shrink and fade away from it. */
export function WheelPicker({ values, value, onChange, format = String, label }: {
  values: number[]; value: number; onChange: (v: number) => void; format?: (v: number) => string; label: string;
}) {
  const t = useTheme();
  const start = Math.max(0, values.indexOf(value));
  const y = useRef(new Animated.Value(start * ROW)).current;
  const { ref, onScroll } = useDetents(values.length, ROW, start, (i) => onChange(values[i]));
  const [sel, setSel] = useState(start);
  useEffect(() => { setSel(Math.max(0, values.indexOf(value))); }, [value, values]);

  return (
    <View
      style={{ height: ROW * VISIBLE, justifyContent: 'center' }}
      accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ text: format(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const i = Math.max(0, Math.min(values.length - 1, sel + (e.nativeEvent.actionName === 'increment' ? 1 : -1)));
        onChange(values[i]); ref.current?.scrollTo({ y: i * ROW, animated: true });
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, height: ROW + 12, borderRadius: radius.pill, borderWidth: 2, borderColor: t.accent, backgroundColor: t.accentSoft }} />
      <Animated.ScrollView
        ref={ref} showsVerticalScrollIndicator={false} snapToInterval={ROW} decelerationRate="fast"
        contentOffset={{ x: 0, y: start * ROW }} contentContainerStyle={{ paddingVertical: ROW * 2 }}
        onLayout={() => ref.current?.scrollTo({ y: start * ROW, animated: false })}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: native, listener: onScroll })}
        scrollEventThrottle={16}
      >
        {values.map((v, i) => {
          const r = [(i - 2) * ROW, (i - 1) * ROW, i * ROW, (i + 1) * ROW, (i + 2) * ROW];
          const on = i === sel;
          return (
            <Pressable key={v} onPress={() => ref.current?.scrollTo({ y: i * ROW, animated: true })} style={{ height: ROW, alignItems: 'center', justifyContent: 'center' }} importantForAccessibility="no">
              <Animated.Text
                style={[type.number, {
                  fontSize: 52, lineHeight: 60, color: on ? t.accent : t.muted,
                  opacity: y.interpolate({ inputRange: r, outputRange: [0.2, 0.5, 1, 0.5, 0.2], extrapolate: 'clamp' }),
                  transform: [{ scale: y.interpolate({ inputRange: r, outputRange: [0.42, 0.6, 1, 0.6, 0.42], extrapolate: 'clamp' }) }],
                }]}
              >
                {format(v)}
              </Animated.Text>
            </Pressable>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const GAP = 14;

/**
 * A ruler you slide under a fixed marker. Long ticks every `major` steps. Horizontal for weight,
 * vertical for height (like a measuring tape on a wall).
 */
export function Ruler({ values, value, onChange, major, vertical, label, display }: {
  values: number[]; value: number; onChange: (v: number) => void; major: number; vertical?: boolean; label: string; display: string;
}) {
  const t = useTheme();
  const nearest = (v: number) => values.reduce((best, x, i) => (Math.abs(x - v) < Math.abs(values[best] - v) ? i : best), 0);
  const start = nearest(value);
  const [size, setSize] = useState(0);
  const { ref, onScroll } = useDetents(values.length, GAP, start, (i) => onChange(values[i]));
  const pad = size / 2;
  const jump = (i: number) => ref.current?.scrollTo(vertical ? { y: i * GAP, animated: false } : { x: i * GAP, animated: false });

  const ticks = useMemo(() => values.map((v, i) => {
    const big = i % major === 0;
    const mid = !big && major % 2 === 0 && i % (major / 2) === 0;
    const len = big ? 44 : mid ? 30 : 20;
    return (
      <View key={v} style={vertical ? { height: GAP, justifyContent: 'center', alignItems: 'flex-end' } : { width: GAP, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={vertical ? { height: 2, width: len, borderRadius: 1, backgroundColor: big ? t.ink : t.line } : { width: 2, height: len, borderRadius: 1, backgroundColor: big ? t.ink : t.line }} />
      </View>
    );
  }), [values, major, vertical, t]);

  const number = <Text style={[type.number, { fontSize: 72, lineHeight: 80, color: t.ink, letterSpacing: -2 }]} accessibilityElementsHidden>{display}</Text>;

  const scroller = (
    <View
      style={vertical ? { width: 120, height: 360 } : { height: 72, alignSelf: 'stretch' }}
      onLayout={(e) => { const s = vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width; setSize(s); requestAnimationFrame(() => jump(start)); }}
      accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ text: display }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const i = Math.max(0, Math.min(values.length - 1, nearest(value) + (e.nativeEvent.actionName === 'increment' ? 1 : -1)));
        onChange(values[i]); jump(i);
      }}
    >
      {size ? (
        <ScrollView
          ref={ref} horizontal={!vertical} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
          snapToInterval={GAP} decelerationRate="fast" onScroll={onScroll} scrollEventThrottle={16}
          contentContainerStyle={vertical ? { paddingVertical: pad - GAP / 2 } : { paddingHorizontal: pad - GAP / 2, alignItems: 'flex-end' }}
        >
          {ticks}
        </ScrollView>
      ) : null}
      <View
        pointerEvents="none"
        style={vertical
          ? { position: 'absolute', right: 0, left: -24, top: '50%', height: 3, marginTop: -1.5, borderRadius: 2, backgroundColor: t.accent }
          : { position: 'absolute', left: '50%', bottom: 0, width: 3, height: 64, marginLeft: -1.5, borderRadius: 2, backgroundColor: t.accent }}
      />
    </View>
  );

  return vertical ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.lg }}>
      <View style={{ flex: 1, alignItems: 'center' }}>{number}</View>
      {scroller}
    </View>
  ) : (
    <View style={{ alignItems: 'center', gap: space.lg }}>
      {number}
      {scroller}
    </View>
  );
}

/** Two-way unit switch (kg / lb, cm / ft). */
export function UnitToggle<U extends string>({ value, options, onChange }: { value: U; options: { value: U; label: string }[]; onChange: (u: U) => void }) {
  const t = useTheme();
  return (
    <View style={{ alignSelf: 'center', flexDirection: 'row', backgroundColor: t.raised, borderRadius: radius.pill, padding: 4 }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value} onPress={() => onChange(o.value)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={o.label}
            style={{ minWidth: 88, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.ink : 'transparent' }}
          >
            <Text style={[type.bodyStrong, { color: on ? t.bg : t.muted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
