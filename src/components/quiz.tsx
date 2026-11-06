import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Text, View } from 'react-native';

import { habitText } from '../lib/i18n';
import { ACTIVITY, DEFAULT_HABITS, GOALS, Profile, targets } from '../lib/model';
import { useStore } from '../lib/store';
import { ease, motion, radius, space, TOUCH, type, useTheme } from '../theme';
import { haptic, PressScale, reduceMotion } from './motion';
import { Ruler, UnitToggle, WheelPicker } from './pickers';
import { Button, Icon, IconButton, IconName, Muted, Screen } from './ui';

const native = Platform.OS !== 'web';

type Draft = Omit<Profile, 'sex' | 'goal'> & { sex: Profile['sex'] | null; goal: number | null };
const range = (a: number, b: number, s = 1) => Array.from({ length: Math.round((b - a) / s) + 1 }, (_, i) => Math.round((a + i * s) * 10) / 10);
const AGES = range(13, 100);
const CMS = range(120, 230);
const INCHES = range(48, 90);
const KGS = range(30, 250, 0.5);
const LBS = range(66, 550);

const STEPS = ['goal', 'sex', 'age', 'height', 'weight', 'activity', 'habits', 'plan'] as const;
type Step = (typeof STEPS)[number];

/**
 * First-time questions, one per screen: goal, sex, age, height, weight, activity and habits,
 * ending on the plan they add up to. Answers save to the profile, which My targets can change later.
 */
export function Quiz({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const t = useTheme();
  const { profile, finishQuiz, t: tr } = useStore();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [imperial, setImperial] = useState(false);
  const [d, setD] = useState<Draft>({ ...profile, sex: null, goal: null, habits: profile.habits });
  const step: Step = STEPS[i];
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));

  const go = (n: number) => { setDir(n); setI((x) => x + n); };
  const back = () => (i === 0 ? onBack() : go(-1));
  const ready = step === 'goal' ? d.goal !== null : step === 'sex' ? d.sex !== null : step === 'habits' ? true : true;
  const full: Profile = { ...d, sex: d.sex ?? 'f', goal: d.goal ?? 0 };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconButton icon="chevron-back" label={tr('ob.back').replace(/^‹\s*/, '')} onPress={back} />
        <Progress value={(i + 1) / STEPS.length} label={tr('quiz.step', { n: i + 1, total: STEPS.length })} />
      </View>

      <Slide key={step} dir={dir}>
        {step === 'goal' ? (
          <Question title={tr('quiz.goalQ')}>
            {GOALS.map((g, k) => (
              <Option
                key={g.value} on={d.goal === g.value} onPress={() => set({ goal: g.value })} label={tr(`goal.${g.value}` as 'goal.0')}
                icon={(['flame-outline', 'trending-down-outline', 'swap-horizontal-outline', 'barbell-outline'] as IconName[])[k]}
              />
            ))}
          </Question>
        ) : step === 'sex' ? (
          <Question title={tr('quiz.sexQ')} sub={tr('quiz.why')}>
            <Option on={d.sex === 'f'} onPress={() => set({ sex: 'f' })} label={tr('prof.female')} icon="female-outline" />
            <Option on={d.sex === 'm'} onPress={() => set({ sex: 'm' })} label={tr('prof.male')} icon="male-outline" />
          </Question>
        ) : step === 'age' ? (
          <Question title={tr('quiz.ageQ')} sub={tr('quiz.why')}>
            <WheelPicker values={AGES} value={d.age} onChange={(age) => set({ age })} label={tr('prof.age')} />
          </Question>
        ) : step === 'height' ? (
          <Question title={tr('quiz.heightQ')} sub={tr('quiz.why')}>
            <UnitToggle value={imperial ? 'ft' : 'cm'} options={[{ value: 'cm', label: 'cm' }, { value: 'ft', label: 'ft / in' }]} onChange={(u) => setImperial(u === 'ft')} />
            {imperial ? (
              <Ruler
                key="in" vertical values={INCHES} major={12} label={tr('prof.height')} value={Math.round(d.height / 2.54)}
                onChange={(inch) => set({ height: Math.round(inch * 2.54) })} display={`${Math.floor(Math.round(d.height / 2.54) / 12)}′${Math.round(d.height / 2.54) % 12}″`}
              />
            ) : (
              <Ruler key="cm" vertical values={CMS} major={10} label={tr('prof.height')} value={d.height} onChange={(height) => set({ height })} display={`${d.height}`} />
            )}
          </Question>
        ) : step === 'weight' ? (
          <Question title={tr('quiz.weightQ')} sub={tr('quiz.why')}>
            <UnitToggle value={imperial ? 'lb' : 'kg'} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} onChange={(u) => setImperial(u === 'lb')} />
            {imperial ? (
              <Ruler
                key="lb" values={LBS} major={10} label={tr('prof.weight')} value={Math.round(d.weight * 2.2046)}
                onChange={(lb) => set({ weight: Math.round((lb / 2.2046) * 10) / 10 })} display={`${Math.round(d.weight * 2.2046)} lb`}
              />
            ) : (
              <Ruler key="kg" values={KGS} major={10} label={tr('prof.weight')} value={d.weight} onChange={(weight) => set({ weight })} display={`${d.weight.toFixed(1)} kg`} />
            )}
            <View style={{ flexDirection: 'row', gap: space.sm, backgroundColor: t.surface, borderRadius: radius.lg, padding: space.lg }}>
              <Icon name="lock-closed-outline" size={20} color={t.muted} />
              <Muted style={{ flex: 1 }}>{tr('quiz.private')}</Muted>
            </View>
          </Question>
        ) : step === 'activity' ? (
          <Question title={tr('quiz.activityQ')}>
            {ACTIVITY.map((a, k) => (
              <Option
                key={a.value} on={d.activity === a.value} onPress={() => set({ activity: a.value })} label={tr(`act.${a.value}` as 'act.1.2')}
                icon={(['bed-outline', 'walk-outline', 'bicycle-outline', 'barbell-outline'] as IconName[])[k]}
              />
            ))}
          </Question>
        ) : step === 'habits' ? (
          <Question title={tr('quiz.habitsQ')} sub={tr('quiz.habitsSub')}>
            {DEFAULT_HABITS.map((h) => {
              const on = d.habits.some((x) => x.id === h.id);
              return (
                <Option
                  key={h.id} multi on={on} label={habitText(h, tr).name}
                  icon={({ h1: 'water-outline', h2: 'nutrition-outline', h3: 'walk-outline', h4: 'moon-outline', h5: 'phone-portrait-outline' } as Record<string, IconName>)[h.id]}
                  onPress={() => set({ habits: on ? d.habits.filter((x) => x.id !== h.id) : DEFAULT_HABITS.filter((x) => x.id === h.id || d.habits.some((y) => y.id === x.id)) })}
                />
              );
            })}
          </Question>
        ) : (
          <Plan profile={full} />
        )}
      </Slide>

      <View style={{ flex: 1 }} />
      {step === 'plan' ? (
        <Button icon="checkmark" label={tr('quiz.start')} onPress={() => { finishQuiz(full); onDone(); }} />
      ) : (
        <Button label={tr('ob.continue')} disabled={!ready} onPress={() => go(1)} />
      )}
    </Screen>
  );
}

/** Thin bar showing how far through the questions you are. Moves with transform only. */
function Progress({ value, label }: { value: number; label: string }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const v = useRef(new Animated.Value(value)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: value, duration: reduceMotion ? 0 : motion.slow, easing: ease.out, useNativeDriver: native }).start();
  }, [value, v]);
  return (
    <View
      style={{ flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: t.raised, overflow: 'hidden' }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <Animated.View style={{ width: '100%', height: '100%', borderRadius: radius.pill, backgroundColor: t.accent, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-w, 0] }) }] }} />
    </View>
  );
}

/** Each question slides in from the side it came from (forward from the right, back from the left). */
function Slide({ children, dir }: { children: ReactNode; dir: number }) {
  const v = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: motion.base, easing: ease.out, useNativeDriver: native }).start();
  }, [v]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [dir * 24, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

function Question({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: space.xl, marginTop: space.md }}>
      <CoachSays title={title} sub={sub} />
      <View style={{ gap: space.sm }} accessibilityRole="radiogroup">{children}</View>
    </View>
  );
}

function Option({ label, icon, on, onPress, multi }: { label: string; icon?: IconName; on: boolean; onPress: () => void; multi?: boolean }) {
  const t = useTheme();
  return (
    <PressScale
      onPress={onPress} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={{ checked: on }} accessibilityLabel={label}
      style={{
        minHeight: 64, paddingHorizontal: space.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: on ? t.ink : t.surface,
        backgroundColor: t.surface, flexDirection: 'row', alignItems: 'center', gap: space.md,
      }}
    >
      {icon ? (
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: on ? t.ink : t.raised, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color={on ? t.bg : t.ink} />
        </View>
      ) : null}
      <Text style={[type.bodyStrong, { color: t.ink, flex: 1 }]}>{label}</Text>
      <Icon name={on ? (multi ? 'checkbox' : 'checkmark-circle') : multi ? 'square-outline' : 'ellipse-outline'} size={24} color={on ? t.ink : t.line} />
    </PressScale>
  );
}

/** The question, asked by the app's coach in a speech bubble. */
function CoachSays({ title, sub }: { title: string; sub?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.md }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.hero, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="sparkles" size={26} color={t.heroCarbs} />
      </View>
      <View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.lg, borderBottomLeftRadius: 6, paddingVertical: space.md, paddingHorizontal: space.lg, gap: 4 }}>
        <Text style={[type.h2, { color: t.ink, fontSize: 22, lineHeight: 28 }]} accessibilityRole="header">{title}</Text>
        {sub ? <Muted>{sub}</Muted> : null}
      </View>
    </View>
  );
}

/** The reveal: what the answers add up to. The daily number counts up once; this screen is seen once. */
function Plan({ profile }: { profile: Profile }) {
  const t = useTheme();
  const { t: tr } = useStore();
  const goal = targets(profile);
  const [shown, setShown] = useState(reduceMotion ? goal.kcal : 0);
  useEffect(() => {
    haptic.celebrate();
    if (reduceMotion) return;
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(v, { toValue: goal.kcal, duration: 900, easing: ease.out, useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [goal.kcal]);
  const diff = profile.goal;

  return (
    <View style={{ gap: space.lg, marginTop: space.md }}>
      <View style={{ gap: space.sm }}>
        <Text style={[type.title, { color: t.ink }]} accessibilityRole="header">{tr('quiz.planTitle')}</Text>
        <Muted style={{ fontSize: 15, lineHeight: 22 }}>{tr('quiz.planSub')}</Muted>
      </View>
      <View style={{ backgroundColor: t.hero, borderRadius: radius.xl, padding: space.xl, gap: space.lg }} accessible accessibilityLabel={`${goal.kcal} ${tr('kcal')}`}>
        <View>
          <Text style={[type.number, { fontSize: 64, lineHeight: 70, color: t.heroInk, letterSpacing: -1.5 }]}>{shown.toLocaleString()}</Text>
          <Text style={[type.body, { color: t.heroMuted }]}>{tr('quiz.perDay')}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {([[tr('protein'), goal.p, t.heroProtein], [tr('carbs'), goal.c, t.heroCarbs], [tr('fat'), goal.f, t.heroFat]] as const).map(([l, v, c]) => (
            <View key={l} style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
                <Text style={[type.small, { color: t.heroMuted }]}>{l}</Text>
              </View>
              <Text style={[type.number, { fontSize: 22, lineHeight: 28, color: t.heroInk }]}>{v} g</Text>
            </View>
          ))}
        </View>
        <Text style={[type.small, { color: t.heroMuted }]}>
          {tr('quiz.maintenance', { n: goal.tdee.toLocaleString() })}{diff ? ` ${tr(diff < 0 ? 'quiz.minus' : 'quiz.plus', { n: Math.abs(diff).toLocaleString() })}` : ''}
        </Text>
      </View>
      <View style={{ backgroundColor: t.surface, borderRadius: radius.lg }}>
        <PlanRow icon="water-outline" text={tr('quiz.water', { n: profile.waterGoal })} />
        <PlanRow icon="checkmark-circle-outline" text={tr('quiz.habitsCount', { n: profile.habits.length })} border />
      </View>
    </View>
  );
}

function PlanRow({ icon, text, border }: { icon: IconName; text: string; border?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: TOUCH + 8, paddingHorizontal: space.lg, borderTopWidth: border ? 1 : 0, borderTopColor: t.line }}>
      <Icon name={icon} size={22} color={t.ink} />
      <Text style={[type.bodyStrong, { color: t.ink }]}>{text}</Text>
    </View>
  );
}
