import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FadeIn, haptic, PressScale } from '../components/motion';
import { FoodThumb, RecipeCard, RecipeSheet } from '../components/recipe';
import { CalorieRing, Card, Chip, Header, Icon, IconButton, IconName, LinkButton, MacroBar, MEAL_ICON, Muted, Screen, styles } from '../components/ui';
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

      <FadeIn>
        <View style={{ backgroundColor: t.hero, borderRadius: radius.lg, padding: space.lg, gap: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
            <CalorieRing value={sum.kcal} goal={goal.kcal} size={148} on="hero" />
            <View style={{ flex: 1, gap: space.md }}>
              <HeroStat icon="flag-outline" n={goal.kcal.toLocaleString()} label={tr('today.goal')} />
              <HeroStat icon="restaurant-outline" n={Math.round(sum.kcal).toLocaleString()} label={tr('today.eaten')} />
              <HeroStat icon="flame-outline" n={goal.tdee.toLocaleString()} label={tr('today.burn')} />
            </View>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={60}>
        <Card>
          <MacroBar label={tr('protein')} value={sum.p} goal={goal.p} color={t.protein} />
          <MacroBar label={tr('carbs')} value={sum.c} goal={goal.c} color={t.carbs} />
          <MacroBar label={tr('fat')} value={sum.f} goal={goal.f} color={t.fat} />
        </Card>
      </FadeIn>

      <FadeIn delay={120}>
        <Card title={tr('today.water')} right={<Text style={[type.label, { color: t.water }]}>{tr('today.glasses', { n: day.water, g: profile.waterGoal })}</Text>}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 }}>
            {Array.from({ length: profile.waterGoal }, (_, i) => {
              const full = i < day.water;
              return (
                <View key={i} style={{ width: `${100 / Math.min(8, profile.waterGoal)}%`, padding: 2 }}>
                  <PressScale
                    accessibilityRole="button" accessibilityLabel={tr('today.waterSet', { n: i + 1 })} accessibilityState={{ selected: full }}
                    onPress={() => {
                      const next = day.water === i + 1 ? i : i + 1;
                      next === profile.waterGoal ? haptic.success() : haptic.soft();
                      setWater(next);
                    }}
                    style={{ height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: full ? t.accentSoft : t.bg }}
                  >
                    <Icon name={full ? 'water' : 'water-outline'} size={24} color={full ? t.water : t.muted} />
                  </PressScale>
                </View>
              );
            })}
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={180}>
        <View style={{ gap: space.md }}>
          <View style={styles.rowBetween}>
            <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('today.ideas')}</Text>
            <LinkButton label={tr('today.allRecipes')} onPress={() => router.push('/recipes')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }} style={{ marginHorizontal: -space.lg }} contentInset={{ left: 0 }}>
            <View style={{ width: space.lg - space.md }} />
            {ideas.map((r) => <RecipeCard key={r.id} recipe={r} width={176} onPress={() => { haptic.tap(); setOpen(r); }} />)}
            <View style={{ width: space.lg - space.md }} />
          </ScrollView>
        </View>
      </FadeIn>

      <FadeIn delay={240}>
        <View style={{ gap: space.md }}>
          <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('today.meals')}</Text>
          {MEALS.map((meal) => {
            const items = day.meals.filter((x) => x.meal === meal);
            const kcal = items.reduce((a, x) => a + x.kcal, 0);
            return (
              <Card key={meal} style={{ gap: items.length ? space.sm : 0, paddingVertical: space.md }}>
                <View style={[styles.rowBetween, { gap: space.md }]}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.raised, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={MEAL_ICON[meal]} size={20} color={t.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.bodyStrong, { color: t.ink }]}>{tr(`meal.${meal}`)}</Text>
                    <Muted>{items.length ? `${Math.round(kcal)} ${tr('kcal')}` : tr('today.nothing')}</Muted>
                  </View>
                  <IconButton icon="add" label={tr('log.addTo', { meal: tr(`meal.${meal}`) })} onPress={() => router.push({ pathname: '/log', params: { meal } })} />
                </View>
                {items.map((x) => (
                  <FadeIn key={x.id}>
                    <View style={[styles.rowBetween, { gap: space.md, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: t.line }]}>
                      <FoodThumb img={x.img} name={x.name} size={40} />
                      <View style={{ flex: 1 }}>
                        <Text style={[type.label, { color: t.ink }]}>{x.name}</Text>
                        <Text style={[type.caption, { color: t.muted }]}>
                          <Text style={{ color: t.protein }}>P</Text> {Math.round(x.p)} g · <Text style={{ color: t.carbs }}>C</Text> {Math.round(x.c)} g · <Text style={{ color: t.fat }}>F</Text> {Math.round(x.f)} g
                        </Text>
                      </View>
                      <Text style={[type.label, { color: t.ink }]}>{Math.round(x.kcal)}</Text>
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
              </Card>
            );
          })}
        </View>
      </FadeIn>
      <RecipeSheet recipe={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}

function HeroStat({ icon, n, label }: { icon: IconName; n: string; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Icon name={icon} size={18} color={t.heroMuted} />
      <View>
        <Text style={[type.number, { fontSize: 18, lineHeight: 22, color: t.heroInk }]}>{n}</Text>
        <Text style={[type.caption, { color: t.heroMuted }]}>{label}</Text>
      </View>
    </View>
  );
}
