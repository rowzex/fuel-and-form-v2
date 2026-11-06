import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { FadeIn, haptic, PressScale, useToast } from '../components/motion';
import { FoodThumb } from '../components/recipe';
import { Button, Card, Chip, Empty, Field, Header, Icon, Input, MEAL_ICON, Screen, styles } from '../components/ui';
import { Food, searchFoods } from '../lib/foods';
import { Meal, MEALS } from '../lib/model';
import { mealForNow } from '../lib/recipes';
import { useStore } from '../lib/store';
import { space, type, useTheme } from '../theme';

export default function LogFood() {
  const t = useTheme();
  const { addEntry, t: tr } = useStore();
  const toast = useToast();
  const params = useLocalSearchParams<{ meal?: string }>();
  const [q, setQ] = useState('');
  const [meal, setMeal] = useState<Meal>(mealForNow);
  const [custom, setCustom] = useState({ name: '', kcal: '', p: '', c: '', f: '' });

  // Opened from a meal's "+" on Today: start on that meal.
  useEffect(() => {
    if (params.meal && (MEALS as string[]).includes(params.meal)) setMeal(params.meal as Meal);
  }, [params.meal]);

  const add = (f: Food) => {
    addEntry({ ...f, meal });
    haptic.success();
    toast(tr('log.added', { name: f.name, meal: tr(`meal.${meal}`) }));
  };
  const addCustom = () => {
    const kcal = Number(custom.kcal);
    if (!custom.name.trim() || !kcal) return;
    add({ name: custom.name.trim(), kcal, p: Number(custom.p) || 0, c: Number(custom.c) || 0, f: Number(custom.f) || 0 });
    setCustom({ name: '', kcal: '', p: '', c: '', f: '' });
  };
  const results = searchFoods(q);
  const macro = (k: 'kcal' | 'p' | 'c' | 'f', label: string) => (
    <Field
      label={label} value={custom[k]} onChangeText={(v) => setCustom({ ...custom, [k]: v })} keyboardType="decimal-pad"
      placeholder="0" style={{ flex: 1 }}
    />
  );

  return (
    <Screen>
      <Header title={tr('log.title')} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }} style={{ marginHorizontal: -space.lg, flexGrow: 0 }}>
        {MEALS.map((m) => <Chip key={m} icon={MEAL_ICON[m]} label={tr(`meal.${m}`)} on={m === meal} onPress={() => setMeal(m)} />)}
      </ScrollView>

      <Input
        icon="search" value={q} onChangeText={setQ} placeholder={tr('log.search')} accessibilityLabel={tr('log.search')}
        autoCorrect={false} clearButtonMode="while-editing" returnKeyType="search"
      />

      <Card style={{ paddingVertical: space.sm, gap: 0 }}>
        {results.length === 0 ? <Empty icon="search-outline" text={tr('log.noMatch')} /> : null}
        {results.map((f, i) => (
          <FadeIn key={f.name} delay={Math.min(i, 8) * 20}>
            <PressScale
              onPress={() => add(f)} accessibilityRole="button" accessibilityLabel={tr('log.addItem', { name: f.name })}
              style={[styles.rowBetween, { minHeight: 64, gap: space.md, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }]}
            >
              <FoodThumb img={f.img} name={f.name} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: t.ink }]}>{f.name}</Text>
                <Text style={[type.caption, { color: t.muted }]}>
                  <Text style={{ color: t.protein }}>P</Text> {f.p} g · <Text style={{ color: t.carbs }}>C</Text> {f.c} g · <Text style={{ color: t.fat }}>F</Text> {f.f} g
                </Text>
              </View>
              <Text style={[type.label, { color: t.ink }]}>{f.kcal} <Text style={[type.caption, { color: t.muted }]}>{tr('kcal')}</Text></Text>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="add" size={22} color={t.accent} />
              </View>
            </PressScale>
          </FadeIn>
        ))}
      </Card>

      <Card title={tr('log.custom')}>
        <Field label={tr('log.customName')} value={custom.name} onChangeText={(name) => setCustom({ ...custom, name })} />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {macro('kcal', tr('kcal'))}
          {macro('p', tr('log.p'))}
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {macro('c', tr('log.c'))}
          {macro('f', tr('log.f'))}
        </View>
        <Button icon="add-circle-outline" label={tr('log.addTo', { meal: tr(`meal.${meal}`) })} onPress={addCustom} disabled={!custom.name.trim() || !Number(custom.kcal)} />
      </Card>
    </Screen>
  );
}
