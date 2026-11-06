import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { FadeIn, haptic, PressScale } from '../components/motion';
import { FoodThumb, RecipeCard, RecipeSheet } from '../components/recipe';
import { Bubble, Button, CalorieRing, Card, Empty, Header, Icon, IconButton, MacroBar, MEAL_ICON, Muted, plain, Screen, styles } from '../components/ui';
import { habitText, LOCALE } from '../lib/i18n';
import { dateKey, Day, isDone, MEALS, targets, totals } from '../lib/model';
import { Recipe } from '../lib/recipes';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';

const tracked = (d?: Day) => !!d && (d.meals.length > 0 || d.water > 0 || d.done.length > 0);

/** Month view of every tracked day. Tap a day to see its food, water, habits and coach chat. */
export default function Calendar() {
  const t = useTheme();
  const { profile, days, coach, setDate, t: tr, lang } = useStore();
  const today = dateKey(new Date());
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(today);
  const [open, setOpen] = useState<Recipe | null>(null);
  const locale = LOCALE[lang ?? 'en'];
  const goal = targets(profile);

  const y = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // weeks start on Monday
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => dateKey(new Date(y, m, i + 1)))];
  while (cells.length % 7) cells.push(null);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'narrow' }));
  const trackedCount = cells.filter((k) => k && (tracked(days[k]) || coach.log[k]?.length)).length;
  const isThisMonth = y === new Date().getFullYear() && m === new Date().getMonth();

  /** Cell colour by how the day went: on target, over, under, or only habits / chat. */
  const status = (k: string): { bg: string; dot: string } | null => {
    const d = days[k];
    if (!d?.meals.length) return tracked(d) || coach.log[k]?.length ? { bg: t.raised, dot: t.muted } : null;
    const kcal = totals(d).kcal;
    if (kcal > goal.kcal * 1.1) return { bg: t.raised, dot: t.carbs };
    if (kcal >= goal.kcal * 0.85) return { bg: t.raised, dot: t.good };
    return { bg: t.raised, dot: t.muted };
  };

  const shift = (n: number) => setMonth(new Date(y, m + n, 1));

  return (
    <Screen>
      <Header
        title={tr('cal.title')}
        right={<IconButton icon="close" label={tr('done')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}
      />

      <Card>
        <View style={styles.rowBetween}>
          <IconButton icon="chevron-back" label={tr('cal.prevMonth')} onPress={() => shift(-1)} />
          <View style={{ alignItems: 'center' }}>
            <Text style={[type.h2, { color: t.ink }]}>{month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</Text>
            <Muted>{tr('cal.tracked', { n: trackedCount })}</Muted>
          </View>
          <IconButton icon="chevron-forward" label={tr('cal.nextMonth')} disabled={isThisMonth} onPress={() => shift(1)} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          {weekdays.map((w, i) => (
            <Text key={i} style={[type.caption, { flex: 1, textAlign: 'center', color: t.muted }]}>{w}</Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((k, i) => {
            if (!k) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
            const future = k > today;
            const on = k === selected;
            const s = status(k);
            return (
              <View key={k} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }}>
                <PressScale
                  disabled={future} onPress={() => { haptic.tap(); setSelected(k); }} accessibilityRole="button" accessibilityLabel={k} accessibilityState={{ selected: on }}
                  style={{
                    flex: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', gap: 3,
                    backgroundColor: on ? t.ink : s ? s.bg : 'transparent', opacity: future ? 0.3 : 1,
                    borderWidth: k === today && !on ? 1.5 : 0, borderColor: t.ink,
                  }}
                >
                  <Text style={[k === today || on ? type.label : type.small, { color: on ? t.bg : t.ink }]}>{Number(k.slice(8))}</Text>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s ? (on ? t.bg : s.dot) : 'transparent' }} />
                </PressScale>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' }}>
          <Muted style={{ fontSize: 12, flex: 1 }}>{tr('cal.legend')}</Muted>
        </View>
      </Card>

      <DayDetail key={selected} k={selected} onOpenRecipe={setOpen} onOpenDay={() => { setDate(selected); router.navigate('/'); }} />
      <RecipeSheet recipe={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}

function DayDetail({ k, onOpenRecipe, onOpenDay }: { k: string; onOpenRecipe: (r: Recipe) => void; onOpenDay: () => void }) {
  const t = useTheme();
  const { profile, days, coach, t: tr, lang } = useStore();
  const day = days[k];
  const chat = coach.log[k] ?? [];
  const goal = targets(profile);
  const sum = totals(day);
  const [y, m, d] = k.split('-').map(Number);
  const title = new Date(y, m - 1, d).toLocaleDateString(LOCALE[lang ?? 'en'], { weekday: 'long', day: 'numeric', month: 'long' });
  const habitsDone = profile.habits.filter((h) => isDone(h, day, profile));

  return (
    <FadeIn>
      <View style={{ gap: space.lg }}>
        <View style={[styles.rowBetween, { gap: space.md }]}>
          <Text style={[type.h2, { color: t.ink, flex: 1 }]} accessibilityRole="header">{title}</Text>
          <Button small kind="secondary" icon="open-outline" label={plain(tr('cal.open'))} onPress={onOpenDay} />
        </View>

        {!tracked(day) && !chat.length ? <Card><Empty icon="calendar-clear-outline" text={tr('cal.empty')} /></Card> : null}

        {tracked(day) ? (
          <Card>
            <View style={{ flexDirection: 'row', gap: space.lg, alignItems: 'center' }}>
              <CalorieRing value={sum.kcal} goal={goal.kcal} size={116} />
              <View style={{ flex: 1, gap: space.sm }}>
                <MacroBar label={tr('protein')} value={sum.p} goal={goal.p} color={t.protein} />
                <MacroBar label={tr('carbs')} value={sum.c} goal={goal.c} color={t.carbs} />
                <MacroBar label={tr('fat')} value={sum.f} goal={goal.f} color={t.fat} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Icon name="water" size={18} color={t.water} />
              <Text style={[type.label, { color: t.ink }]}>{tr('cal.water', { n: day!.water, g: profile.waterGoal })}</Text>
            </View>
          </Card>
        ) : null}

        {day?.meals.length ? (
          <Card title={tr('cal.meals')}>
            {MEALS.map((meal) => {
              const items = day.meals.filter((x) => x.meal === meal);
              if (!items.length) return null;
              return (
                <View key={meal} style={{ gap: space.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name={MEAL_ICON[meal]} size={16} color={t.muted} />
                    <Text style={[type.label, { color: t.muted }]}>{tr(`meal.${meal}`)}</Text>
                  </View>
                  {items.map((x) => (
                    <View key={x.id} style={[styles.rowBetween, { gap: space.md, paddingVertical: space.xs }]}>
                      <FoodThumb img={x.img} name={x.name} size={36} />
                      <Text style={[type.small, { color: t.ink, flex: 1 }]}>{x.name}</Text>
                      <Text style={[type.label, { color: t.ink }]}>{Math.round(x.kcal)}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </Card>
        ) : null}

        {tracked(day) ? (
          <Card title={tr('cal.habits')} right={<Text style={[type.label, { color: t.accent }]}>{habitsDone.length} / {profile.habits.length}</Text>}>
            {profile.habits.map((h) => {
              const done = isDone(h, day, profile);
              return (
                <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Icon name={done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={done ? t.accent : t.muted} />
                  <Text style={[type.small, { color: done ? t.ink : t.muted, flex: 1 }]}>{habitText(h, tr).name}</Text>
                </View>
              );
            })}
          </Card>
        ) : null}

        <Card title={tr('cal.chat')}>
          {chat.length === 0 ? <Muted>{tr('cal.noChat')}</Muted> : null}
          {chat.map((msg, i) => (
            <View key={i} style={{ gap: space.sm }}>
              {msg.at && msg.role === 'user' ? <Muted style={{ fontSize: 12, textAlign: 'center' }}>{msg.at}</Muted> : null}
              <Bubble role={msg.role} text={msg.content} />
              {msg.recipes?.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }}>
                  {msg.recipes.map((r) => <RecipeCard key={r.id} recipe={r} width={160} onPress={() => { haptic.tap(); onOpenRecipe(r); }} />)}
                </ScrollView>
              ) : null}
            </View>
          ))}
        </Card>
      </View>
    </FadeIn>
  );
}
