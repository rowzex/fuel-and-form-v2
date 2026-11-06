import { useState } from 'react';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ingredientImage, useDishImage } from '../lib/images';
import { Meal, MEALS } from '../lib/model';
import { Recipe } from '../lib/recipes';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';
import { haptic, PressScale, useToast } from './motion';
import { Button, Chip, Icon, IconButton, MEAL_ICON, Muted } from './ui';

/**
 * A photo via expo-image (memory + disk cache, decoded off the main thread), cross-fading in
 * over a tinted tile with a food icon, which stays as the fallback if the photo fails.
 */
function Photo({ uri, label, size, radius: r = radius.md, tint }: { uri: string | null; label: string; size: { width: number | `${number}%`; height: number }; radius?: number; tint?: string }) {
  const t = useTheme();
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ ...size, borderRadius: r, overflow: 'hidden', backgroundColor: tint ?? t.raised, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="restaurant-outline" size={Math.min(32, size.height / 2.6)} color={t.muted} />
      {uri && !failed ? (
        <Image
          source={{ uri }} onError={() => setFailed(true)} transition={{ duration: 200, effect: 'cross-dissolve' }}
          cachePolicy="memory-disk" recyclingKey={uri} contentFit="cover"
          style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors accessibilityLabel={label}
        />
      ) : null}
    </View>
  );
}

export function FoodThumb({ img, name, size = 40 }: { img?: string; name: string; size?: number }) {
  return <Photo uri={img ? ingredientImage(img) : null} label={name} size={{ width: size, height: size }} radius={size / 2} />;
}

export function RecipePhoto({ recipe, height, radius: r = radius.md }: { recipe: Recipe; height: number; radius?: number }) {
  const uri = useDishImage(recipe.imageQuery, recipe.mainIngredient, recipe.title);
  return <Photo uri={uri} label={recipe.title} size={{ width: '100%', height }} radius={r} />;
}

/** Protein / carbs / fat as three small coloured pills. */
export function MacroPills({ p, c, f }: { p: number; c: number; f: number }) {
  const t = useTheme();
  const { t: tr } = useStore();
  return (
    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
      {([[tr('protein'), p, t.protein], [tr('carbs'), c, t.carbs], [tr('fat'), f, t.fat]] as const).map(([l, v, color]) => (
        <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: t.raised }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
          <Text style={[type.caption, { color: t.ink }]}>{l} {v} g</Text>
        </View>
      ))}
    </View>
  );
}

export function RecipeCard({ recipe, onPress, width = 200 }: { recipe: Recipe; onPress: () => void; width?: number }) {
  const t = useTheme();
  const { t: tr } = useStore();
  return (
    <PressScale
      onPress={onPress} accessibilityRole="button" accessibilityLabel={`${recipe.title}, ${recipe.kcal} ${tr('kcal')}`}
      style={{ width, backgroundColor: t.surface, borderRadius: radius.lg, overflow: 'hidden' }}
    >
      <RecipePhoto recipe={recipe} height={width * 0.66} radius={0} />
      <View style={{ padding: space.md, gap: 6 }}>
        <Text numberOfLines={2} style={[type.label, { color: t.ink, minHeight: 40 }]}>{recipe.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Icon name="flame-outline" size={14} color={t.accent} />
          <Text style={[type.caption, { color: t.ink }]}>{recipe.kcal} {tr('kcal')}</Text>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.protein }} />
          <Text style={[type.caption, { color: t.muted }]}>{recipe.p} g</Text>
        </View>
      </View>
    </PressScale>
  );
}

/** Full recipe in a bottom sheet, with one-tap logging and saving. */
export function RecipeSheet({ recipe, onClose }: { recipe: Recipe | null; onClose: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { addEntry, saved, toggleSaved, t: tr } = useStore();
  const [meal, setMeal] = useState<Meal | null>(null);
  if (!recipe) return null;
  const chosen = meal ?? recipe.meal;
  const isSaved = saved.some((r) => r.title === recipe.title);

  const log = () => {
    addEntry({ name: recipe.title, kcal: recipe.kcal, p: recipe.p, c: recipe.c, f: recipe.f, meal: chosen, img: recipe.mainIngredient });
    haptic.confirm();
    toast(tr('recipe.logged', { name: recipe.title, meal: tr(`meal.${chosen}`) }));
    setMeal(null);
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: '#000000a6' }} onPress={onClose} accessibilityLabel={tr('recipe.close')} />
      <View style={{ maxHeight: '90%', backgroundColor: t.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.lg }}>
          <View>
            <RecipePhoto recipe={recipe} height={232} radius={0} />
            <View style={{ position: 'absolute', top: space.sm, alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#ffffffcc' }} />
            <View style={{ position: 'absolute', top: space.lg, right: space.lg }}>
              <IconButton icon="close" label={tr('recipe.close')} onPress={onClose} />
            </View>
          </View>
          <View style={{ padding: space.xl - 4, gap: space.xl }}>
            <View style={{ gap: space.sm }}>
              <Text style={[type.title, { color: t.ink }]}>{recipe.title}</Text>
              <View style={{ flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' }}>
                <MetaInline icon={MEAL_ICON[recipe.meal]} text={tr(`meal.${recipe.meal}`)} />
                <MetaInline icon="time-outline" text={`${recipe.minutes} ${tr('min')}`} />
                <MetaInline icon="person-outline" text={tr('recipe.perServing')} />
              </View>
              {recipe.why ? (
                <View style={{ flexDirection: 'row', gap: space.sm, backgroundColor: t.accentSoft, borderRadius: radius.md, padding: space.md }}>
                  <Icon name="sparkles" size={18} color={t.accent} />
                  <Text style={[type.small, { color: t.ink, flex: 1 }]}>{recipe.why}</Text>
                </View>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: space.sm }}>
              {([
                [String(recipe.kcal), tr('kcal'), t.accent],
                [`${recipe.p} g`, tr('protein'), t.protein],
                [`${recipe.c} g`, tr('carbs'), t.carbs],
                [`${recipe.f} g`, tr('fat'), t.fat],
              ] as const).map(([v, l, c]) => (
                <View key={l} style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.md, paddingVertical: space.md, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: t.line, borderTopWidth: 4, borderTopColor: c }}>
                  <Text style={[type.number, { fontSize: 18, color: t.ink }]}>{v}</Text>
                  <Text style={[type.caption, { color: t.muted }]}>{l}</Text>
                </View>
              ))}
            </View>

            <View style={{ gap: space.sm }}>
              <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('recipe.ingredients')}</Text>
              {recipe.ingredients.map((x, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center', paddingVertical: 2 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.accent }} />
                  <Text style={[type.body, { color: t.ink, flex: 1 }]}>{x}</Text>
                </View>
              ))}
            </View>

            <View style={{ gap: space.md }}>
              <Text style={[type.h2, { color: t.ink }]} accessibilityRole="header">{tr('recipe.steps')}</Text>
              {recipe.steps.map((x, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: space.md }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[type.label, { color: t.accent }]}>{i + 1}</Text>
                  </View>
                  <Text style={[type.body, { color: t.ink, flex: 1 }]}>{x}</Text>
                </View>
              ))}
            </View>

            <View style={{ gap: space.sm }}>
              <Muted>{tr('recipe.logAs')}</Muted>
              <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
                {MEALS.map((m) => <Chip key={m} icon={MEAL_ICON[m]} label={tr(`meal.${m}`)} on={m === chosen} onPress={() => setMeal(m)} />)}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Button style={{ flex: 1 }} icon="add-circle-outline" label={tr('recipe.logTo', { meal: tr(`meal.${chosen}`) })} onPress={log} />
              <Button
                kind="secondary" icon={isSaved ? 'bookmark' : 'bookmark-outline'} label={isSaved ? tr('recipe.saved') : tr('save')}
                onPress={() => { toggleSaved(recipe); toast(isSaved ? tr('recipe.unsaved') : tr('recipe.savedToast')); }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function MetaInline({ icon, text }: { icon: Parameters<typeof Icon>[0]['name']; text: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={16} color={t.muted} />
      <Text style={[type.small, { color: t.muted }]}>{text}</Text>
    </View>
  );
}
