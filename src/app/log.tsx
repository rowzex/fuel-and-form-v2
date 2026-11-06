import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { BarcodeScanner, OffRow, PortionSheet } from '../components/food';
import { haptic, PressScale, useToast } from '../components/motion';
import { FoodThumb } from '../components/recipe';
import { Button, Card, Chip, Empty, Field, Header, Icon, IconButton, Input, MEAL_ICON, Muted, Screen, styles } from '../components/ui';
import { Food, searchFoods } from '../lib/foods';
import { Meal, MEALS } from '../lib/model';
import { forGrams, OffFood, searchOff } from '../lib/off';
import { mealForNow } from '../lib/recipes';
import { useStore } from '../lib/store';
import { space, type, useTheme } from '../theme';

export default function LogFood() {
  const t = useTheme();
  const { addEntry, t: tr, lang } = useStore();
  const toast = useToast();
  const params = useLocalSearchParams<{ meal?: string }>();
  const [q, setQ] = useState('');
  const [meal, setMeal] = useState<Meal>(mealForNow);
  const [custom, setCustom] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const [online, setOnline] = useState<{ state: 'idle' | 'loading' | 'done' | 'error'; items: OffFood[] }>({ state: 'idle', items: [] });
  const [portion, setPortion] = useState<OffFood | null>(null);
  const [scanning, setScanning] = useState(false);

  // Packaged foods from Open Food Facts: wait until typing pauses (its search allows ~10 a minute).
  useEffect(() => {
    const query = q.trim();
    if (query.length < 3) { setOnline({ state: 'idle', items: [] }); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setOnline((o) => ({ state: 'loading', items: o.items }));
      searchOff(query, lang ?? 'en', ctrl.signal)
        .then((items) => setOnline({ state: 'done', items }))
        .catch((e) => { if (!ctrl.signal.aborted) setOnline({ state: 'error', items: [] }); void e; });
    }, 600);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q, lang]);

  // Opened from a meal's "+" on Today: start on that meal.
  useEffect(() => {
    if (params.meal && (MEALS as string[]).includes(params.meal)) setMeal(params.meal as Meal);
  }, [params.meal]);

  const add = (f: Food) => {
    addEntry({ ...f, meal });
    haptic.success();
    toast(tr('log.added', { name: f.name, meal: tr(`meal.${meal}`) }));
  };
  const addPortion = (food: OffFood, grams: number) => {
    const v = forGrams(food.per100, grams);
    const name = `${food.name}${food.brand ? ` (${food.brand})` : ''}, ${Math.round(grams)} g`;
    add({ name, ...v, img: food.img });
    setPortion(null);
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

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Input
          style={{ flex: 1 }} icon="search" value={q} onChangeText={setQ} placeholder={tr('log.search')} accessibilityLabel={tr('log.search')}
          autoCorrect={false} clearButtonMode="while-editing" returnKeyType="search"
        />
        <IconButton icon="barcode-outline" tone="filled" label={tr('log.scan')} onPress={() => setScanning(true)} />
      </View>

      {q.trim().length >= 3 ? (
        <View style={{ gap: space.sm }}>
          <View style={[styles.rowBetween, { gap: space.sm }]}>
            <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('log.online')}</Text>
            {online.state === 'loading' ? <ActivityIndicator color={t.muted} accessibilityLabel={tr('log.searching')} /> : null}
          </View>
          <Card style={{ paddingVertical: space.sm, gap: 0 }}>
            {online.state === 'error' ? <Empty icon="cloud-offline-outline" text={tr('log.offline')} /> : null}
            {online.state === 'loading' && !online.items.length ? <Muted style={{ paddingVertical: space.md }}>{tr('log.searching')}</Muted> : null}
            {online.state === 'done' && !online.items.length ? <Empty icon="search-outline" text={tr('log.noMatch')} /> : null}
            {online.items.slice(0, 12).map((f, i) => <OffRow key={f.code || f.name} food={f} first={i === 0} onPress={() => { haptic.tap(); setPortion(f); }} />)}
          </Card>
          <Muted style={{ fontSize: 12 }}>{tr('log.source')}</Muted>
        </View>
      ) : q.trim() ? <Muted>{tr('log.typeMore')}</Muted> : null}

      {results.length || q.trim().length < 3 ? <>
      <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('log.common')}</Text>
      <Card style={{ paddingVertical: space.sm, gap: 0 }}>
        {results.length === 0 ? <Empty icon="search-outline" text={tr('log.noMatch')} /> : null}
        {results.map((f, i) => (
          <View key={f.name}>
            <PressScale
              onPress={() => add(f)} accessibilityRole="button" accessibilityLabel={tr('log.addItem', { name: f.name })}
              style={[styles.rowBetween, { minHeight: 64, gap: space.md, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }]}
            >
              <FoodThumb img={f.img} name={f.name} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: t.ink }]}>{f.name}</Text>
                <Text style={[type.caption, { color: t.muted }]}>
                  <Text style={{ color: t.protein }}>P</Text> {f.p} g   <Text style={{ color: t.carbs }}>C</Text> {f.c} g   <Text style={{ color: t.fat }}>F</Text> {f.f} g
                </Text>
              </View>
              <Text style={[type.label, { color: t.ink }]}>{f.kcal} <Text style={[type.caption, { color: t.muted }]}>{tr('kcal')}</Text></Text>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="add" size={22} color={t.accent} />
              </View>
            </PressScale>
          </View>
        ))}
      </Card>
      </> : null}

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
      <PortionSheet food={portion} mealLabel={tr(`meal.${meal}`)} onAdd={addPortion} onClose={() => setPortion(null)} />
      <BarcodeScanner open={scanning} onClose={() => setScanning(false)} onFound={(f) => { setScanning(false); setPortion(f); }} />
    </Screen>
  );
}
