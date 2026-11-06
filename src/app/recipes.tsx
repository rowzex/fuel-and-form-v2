import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FadeIn } from '../components/motion';
import { MacroPills, RecipePhoto, RecipeSheet } from '../components/recipe';
import { Card, Chip, Empty, Header, Icon, IconName, MEAL_ICON, Muted, Screen } from '../components/ui';
import { Meal, MEALS, targets, totals } from '../lib/model';
import { rankForToday, Recipe, RECIPES } from '../lib/recipes';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';

type Filter = 'For you' | 'Saved' | 'High protein' | Meal;
const FILTERS: Filter[] = ['For you', 'Saved', 'High protein', ...MEALS];
const FILTER_ICON: Record<Filter, IconName> = { 'For you': 'sparkles-outline', Saved: 'bookmark-outline', 'High protein': 'barbell-outline', ...MEAL_ICON };

export default function Recipes() {
  const t = useTheme();
  const { profile, day, saved, t: tr } = useStore();
  const [filter, setFilter] = useState<Filter>('For you');
  const [open, setOpen] = useState<Recipe | null>(null);
  const goal = targets(profile);
  const sum = totals(day);
  const kcalLeft = Math.round(goal.kcal - sum.kcal);

  const filterLabel = (f: Filter) =>
    f === 'For you' ? tr('recipes.forYou') : f === 'Saved' ? tr('recipes.saved') : f === 'High protein' ? tr('recipes.highProtein') : tr(`meal.${f}`);
  const all = [...saved, ...RECIPES.filter((r) => !saved.some((s) => s.title === r.title))];
  const list =
    filter === 'For you' ? rankForToday(all, kcalLeft, goal.p - sum.p)
    : filter === 'Saved' ? saved
    : filter === 'High protein' ? [...all].filter((r) => (r.p * 4) / r.kcal >= 0.3).sort((a, b) => b.p - a.p)
    : all.filter((r) => r.meal === filter);

  return (
    <Screen>
      <View style={{ gap: space.xs }}>
        <Header title={tr('recipes.title')} />
        <Muted>{kcalLeft > 0 ? tr('recipes.left', { n: kcalLeft }) : tr('recipes.reached')}</Muted>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }} style={{ marginHorizontal: -space.lg, flexGrow: 0 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f} icon={FILTER_ICON[f]} on={f === filter} onPress={() => setFilter(f)}
            label={`${filterLabel(f)}${f === 'Saved' && saved.length ? ` (${saved.length})` : ''}`}
          />
        ))}
      </ScrollView>

      {list.length === 0 ? (
        <Card><Empty icon="bookmark-outline" text={tr('recipes.none')} /></Card>
      ) : (
        list.map((r, i) => (
          <FadeIn key={`${filter}-${r.id}`} delay={Math.min(i, 6) * 40}>
            <Pressable onPress={() => { setOpen(r); }} accessibilityRole="button" accessibilityLabel={`${r.title}, ${r.kcal} ${tr('kcal')}`}>
              {({ pressed }) => (
                <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: t.line, overflow: 'hidden', opacity: pressed ? 0.88 : 1 }}>
                  <View>
                    <RecipePhoto recipe={r} height={176} radius={0} />
                    <View style={{ position: 'absolute', left: space.md, top: space.md, flexDirection: 'row', gap: 6 }}>
                      <Badge icon={MEAL_ICON[r.meal]} text={tr(`meal.${r.meal}`)} />
                      {r.source === 'coach' ? <Badge icon="sparkles" text={tr('recipes.fromCoach')} accent /> : null}
                    </View>
                  </View>
                  <View style={{ padding: space.lg, gap: space.sm }}>
                    <Text style={[type.h2, { color: t.ink }]}>{r.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
                      <Meta icon="flame-outline" text={`${r.kcal} ${tr('kcal')}`} strong />
                      <Meta icon="time-outline" text={`${r.minutes} ${tr('min')}`} />
                    </View>
                    <MacroPills p={r.p} c={r.c} f={r.f} />
                  </View>
                </View>
              )}
            </Pressable>
          </FadeIn>
        ))
      )}
      <Muted style={{ fontSize: 12 }}>{tr('recipes.photoNote')}</Muted>
      <RecipeSheet recipe={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}

function Badge({ icon, text, accent }: { icon: IconName; text: string; accent?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: accent ? t.accent : t.surface }}>
      <Icon name={icon} size={14} color={accent ? t.accentInk : t.ink} />
      <Text style={[type.caption, { color: accent ? t.accentInk : t.ink }]}>{text}</Text>
    </View>
  );
}

function Meta({ icon, text, strong }: { icon: IconName; text: string; strong?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={16} color={strong ? t.accent : t.muted} />
      <Text style={[type.label, { color: strong ? t.ink : t.muted }]}>{text}</Text>
    </View>
  );
}
