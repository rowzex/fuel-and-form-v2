import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FadeIn, haptic, PressScale } from '../components/motion';
import { FoodThumb, RecipeCard, RecipeSheet } from '../components/recipe';
import { Chip, Header, Icon, IconButton, LinkButton, MEAL_ICON, Muted, Plate, Screen, styles } from '../components/ui';
import { LOCALE } from '../lib/i18n';
import { dateKey, MEALS, shiftKey, targets, totals } from '../lib/model';
import { mealForNow, rankForToday, Recipe, RECIPES } from '../lib/recipes';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';

export default function Today() {
  const t = useTheme();
  const { profile, day, date, setDate, setWater, removeEntry, saved, t: tr, lang } = useStore();
  const [open, setOpen] = useState<Recipe | null>(null);
  const goal = targets(profile);
  const sum = totals(day);
  const ideas = rankForToday([...saved, ...RECIPES.filter((r) => !saved.some((s) => s.title === r.title))], goal.kcal - sum.kcal, goal.p - sum.p, mealForNow()).slice(0, 5);

  const today = dateKey(new Date());
  const [y, m, d] = date.split('-').map(Number);
  const longDate = new Date(y, m - 1, d).toLocaleDateString(LOCALE[lang ?? 'en'], { weekday: 'long', day: 'numeric', month: 'long' });
  const title = date === today ? tr('day.today') : date === shiftKey(today, -1) ? tr('day.yesterday') : longDate;

  return (
    <Screen>
      <Header
        subtitle={date === today || date === shiftKey(today, -1) ? longDate : 'Fuel & Form'}
        title={title}
        right={
          <>
            <IconButton icon="calendar-outline" label={tr('tab.calendar')} onPress={() => router.push('/calendar')} />
            <IconButton icon="person-outline" label={tr('tab.targets')} onPress={() => router.push('/profile')} />
          </>
        }
      />
      {date !== today ? (
        <View style={{ flexDirection: 'row' }}>
          <Chip icon="arrow-undo-outline" label={tr('day.today')} on={false} onPress={() => setDate(today)} />
        </View>
      ) : null}

      <View style={{ backgroundColor: t.hero, borderRadius: radius.xl, paddingVertical: space.xl, paddingHorizontal: space.lg, alignItems: 'center', gap: space.lg }}>
        <Plate kcal={sum.kcal} goal={goal} p={sum.p} c={sum.c} f={sum.f} size={232} />
        <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
          <HeroStat color={t.heroProtein} n={`${Math.round(sum.p)}`} g={goal.p} label={tr('protein')} />
          <HeroStat color={t.heroCarbs} n={`${Math.round(sum.c)}`} g={goal.c} label={tr('carbs')} />
          <HeroStat color={t.heroFat} n={`${Math.round(sum.f)}`} g={goal.f} label={tr('fat')} />
        </View>
        <Text style={[type.small, { color: t.heroMuted, textAlign: 'center' }]}>
          {Math.round(sum.kcal).toLocaleString()} {tr('today.eaten')} / {goal.kcal.toLocaleString()} {tr('kcal')}
        </Text>
      </View>

      <View style={{ gap: space.sm }}>
        <View style={styles.rowBetween}>
          <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('today.water')}</Text>
          <Text style={[type.label, { color: t.water }]}>{tr('today.glasses', { n: day.water, g: profile.waterGoal })}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 }}>
          {Array.from({ length: profile.waterGoal }, (_, i) => {
            const full = i < day.water;
            return (
              <View key={i} style={{ width: `${100 / Math.min(8, profile.waterGoal)}%`, padding: 3 }}>
                <PressScale
                  accessibilityRole="button" accessibilityLabel={tr('today.waterSet', { n: i + 1 })} accessibilityState={{ selected: full }}
                  onPress={() => {
                    const next = day.water === i + 1 ? i : i + 1;
                    next === profile.waterGoal ? haptic.success() : haptic.soft();
                    setWater(next);
                  }}
                  style={{ height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: full ? t.waterSoft : t.surface }}
                >
                  <Icon name={full ? 'water' : 'water-outline'} size={22} color={full ? t.water : t.muted} />
                </PressScale>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ gap: space.sm }}>
        <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('today.meals')}</Text>
        <View style={[styles.sheet, { backgroundColor: t.surface }]}>
          {MEALS.map((meal, mi) => {
            const items = day.meals.filter((x) => x.meal === meal);
            const kcal = items.reduce((a, x) => a + x.kcal, 0);
            return (
              <View key={meal} style={{ paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.sm, borderTopWidth: mi ? 1 : 0, borderTopColor: t.line }}>
                <View style={[styles.rowBetween, { gap: space.md }]}>
                  <Icon name={MEAL_ICON[meal]} size={22} color={t.ink} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.bodyStrong, { color: t.ink }]}>{tr(`meal.${meal}`)}</Text>
                    <Muted>{items.length ? `${Math.round(kcal)} ${tr('kcal')}` : tr('today.nothing')}</Muted>
                  </View>
                  <IconButton icon="add" label={tr('log.addTo', { meal: tr(`meal.${meal}`) })} onPress={() => router.push({ pathname: '/log', params: { meal } })} />
                </View>
                {items.map((x) => (
                  <FadeIn key={x.id}>
                    <View style={[styles.rowBetween, { gap: space.md }]}>
                      <FoodThumb img={x.img} name={x.name} size={36} />
                      <View style={{ flex: 1 }}>
                        <Text style={[type.label, { color: t.ink }]}>{x.name}</Text>
                        <Text style={[type.caption, { color: t.muted }]}>
                          <Text style={{ color: t.protein }}>P</Text> {Math.round(x.p)} g   <Text style={{ color: t.carbs }}>C</Text> {Math.round(x.c)} g   <Text style={{ color: t.fat }}>F</Text> {Math.round(x.f)} g
                        </Text>
                      </View>
                      <Text style={[type.number, { fontSize: 16, color: t.ink }]}>{Math.round(x.kcal)}</Text>
                      <Pressable
                        accessibilityRole="button" accessibilityLabel={tr('today.remove', { name: x.name })} hitSlop={10}
                        onPress={() => { haptic.soft(); removeEntry(x.id); }}
                        style={({ pressed }) => ({ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? t.raised : 'transparent' })}
                      >
                        <Icon name="close" size={18} color={t.muted} />
                      </Pressable>
                    </View>
                  </FadeIn>
                ))}
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ gap: space.sm }}>
        <View style={styles.rowBetween}>
          <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('today.ideas')}</Text>
          <LinkButton label={tr('today.allRecipes')} onPress={() => router.push('/recipes')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingHorizontal: space.lg }} style={{ marginHorizontal: -space.lg }}>
          {ideas.map((r) => <RecipeCard key={r.id} recipe={r} width={176} onPress={() => { haptic.tap(); setOpen(r); }} />)}
        </ScrollView>
      </View>
      <RecipeSheet recipe={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}

function HeroStat({ color, n, g, label }: { color: string; n: string; g: number; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={[type.small, { color: t.heroMuted }]}>{label}</Text>
      </View>
      <Text style={[type.number, { fontSize: 20, lineHeight: 26, color: t.heroInk }]}>
        {n}<Text style={[type.small, { color: t.heroMuted }]}> / {g} g</Text>
      </Text>
    </View>
  );
}
