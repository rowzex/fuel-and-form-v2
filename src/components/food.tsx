import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { forGrams, OffFood, productByCode } from '../lib/off';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';
import { haptic, PressScale } from './motion';
import { FoodThumb } from './recipe';
import { Button, Chip, Field, Icon, IconButton, Muted, styles } from './ui';

/** One packaged food in a result list: photo, name, brand and its values per 100 g. */
export function OffRow({ food, first, onPress }: { food: OffFood; first: boolean; onPress: () => void }) {
  const t = useTheme();
  const { t: tr } = useStore();
  return (
    <PressScale
      onPress={onPress} accessibilityRole="button" accessibilityLabel={tr('log.addItem', { name: food.name })}
      style={[styles.rowBetween, { minHeight: 64, gap: space.md, borderTopWidth: first ? 0 : 1, borderTopColor: t.line }]}
    >
      <FoodThumb img={food.img} name={food.name} size={44} />
      <View style={{ flex: 1 }}>
        <Text style={[type.label, { color: t.ink }]} numberOfLines={2}>{food.name}</Text>
        <Text style={[type.caption, { color: t.muted }]} numberOfLines={1}>
          {food.brand ? `${food.brand}, ` : ''}{food.per100.kcal} {tr('kcal')} {tr('log.per100')}
        </Text>
      </View>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="add" size={22} color={t.accent} />
      </View>
    </PressScale>
  );
}

/**
 * Bottom sheet that asks how much was eaten, then adds it. Packaged foods are stored per 100 g,
 * so this is where grams become calories: one serving (when the label gives one), 100 g, or any amount.
 */
export function PortionSheet({ food, mealLabel, onAdd, onClose }: {
  food: OffFood | null; mealLabel: string; onAdd: (f: OffFood, grams: number) => void; onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { t: tr } = useStore();
  const [grams, setGrams] = useState('');
  useEffect(() => { if (food) setGrams(String(food.serving ?? 100)); }, [food]);
  if (!food) return null;
  const g = Math.max(0, Number(grams.replace(',', '.')) || 0);
  const v = forGrams(food.per100, g);
  const presets = [...(food.serving ? [food.serving] : []), 50, 100, 150, 200].filter((x, i, a) => a.indexOf(x) === i).slice(0, 4);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: '#000000a6' }} onPress={onClose} accessibilityLabel={tr('close')} />
      <View style={{ backgroundColor: t.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '90%' }}>
        <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: insets.bottom + space.xl }} keyboardShouldPersistTaps="handled">
          <View style={[styles.rowBetween, { gap: space.md, alignItems: 'flex-start' }]}>
            <FoodThumb img={food.img} name={food.name} size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[type.h2, { color: t.ink }]}>{food.name}</Text>
              <Muted>{food.brand ? `${food.brand}, ` : ''}{food.per100.kcal} {tr('kcal')} {tr('log.per100')}</Muted>
            </View>
            <IconButton icon="close" label={tr('close')} onPress={onClose} />
          </View>

          <View style={{ gap: space.sm }}>
            <Text style={[type.bodyStrong, { color: t.ink }]}>{tr('log.portion')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {presets.map((p) => (
                <Chip key={p} label={p === food.serving ? tr('log.serving', { g: p }) : `${p} g`} on={g === p} onPress={() => setGrams(String(p))} />
              ))}
            </View>
            <Field label={tr('log.grams')} value={grams} onChangeText={setGrams} keyboardType="decimal-pad" selectTextOnFocus />
          </View>

          <View style={{ flexDirection: 'row', backgroundColor: t.surface, borderRadius: radius.lg, paddingVertical: space.md }} accessible accessibilityLabel={`${v.kcal} ${tr('kcal')}, ${tr('protein')} ${v.p} g, ${tr('carbs')} ${v.c} g, ${tr('fat')} ${v.f} g`}>
            {([[String(v.kcal), tr('kcal'), t.accent], [`${v.p} g`, tr('protein'), t.protein], [`${v.c} g`, tr('carbs'), t.carbs], [`${v.f} g`, tr('fat'), t.fat]] as const).map(([n, l, c]) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                <Text style={[type.number, { fontSize: 20, lineHeight: 26, color: t.ink }]}>{n}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
                  <Text style={[type.caption, { color: t.muted }]}>{l}</Text>
                </View>
              </View>
            ))}
          </View>

          <Button icon="add-circle-outline" label={tr('log.addTo', { meal: mealLabel })} disabled={!g} onPress={() => onAdd(food, g)} />
          <Muted style={{ fontSize: 12 }}>{tr('log.source')}</Muted>
        </ScrollView>
      </View>
    </Modal>
  );
}

const BARCODES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

/** Full-screen camera that reads a food barcode, looks it up, and hands back the product. */
export function BarcodeScanner({ open, onClose, onFound }: { open: boolean; onClose: () => void; onFound: (f: OffFood) => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { t: tr, lang } = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<{ kind: 'idle' | 'looking' | 'missing' | 'error'; code?: string }>({ kind: 'idle' });
  const busy = useRef(false);

  useEffect(() => { if (open) { busy.current = false; setStatus({ kind: 'idle' }); } }, [open]);
  if (!open) return null;

  const onScan = async ({ data }: { data: string }) => {
    if (busy.current || !/^\d{8,14}$/.test(data)) return;
    busy.current = true;
        setStatus({ kind: 'looking', code: data });
    try {
      const food = await productByCode(data, lang ?? 'en');
      if (food) { haptic.confirm(); onFound(food); return; }
      setStatus({ kind: 'missing', code: data });
    } catch {
      setStatus({ kind: 'error', code: data });
    }
    // Let the next barcode through after a pause, so one label isn't read twenty times.
    setTimeout(() => { busy.current = false; }, 1500);
  };

  const web = Platform.OS === 'web';
  const message =
    status.kind === 'looking' ? tr('log.lookingUp', { code: status.code ?? '' })
      : status.kind === 'missing' ? tr('log.notFound')
        : status.kind === 'error' ? tr('log.offline')
          : tr('log.scanHint');

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {!web && permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: [...BARCODES] }} onBarcodeScanned={onScan} />
        ) : null}

        <View style={{ position: 'absolute', top: insets.top + space.sm, right: space.lg }}>
          <IconButton icon="close" label={tr('close')} onPress={onClose} />
        </View>

        {!web && permission?.granted ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
            <View style={{ width: '78%', aspectRatio: 1.6, borderRadius: radius.lg, borderWidth: 3, borderColor: '#FFFFFF' }} />
          </View>
        ) : null}

        <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: insets.bottom + space.xl }}>
          <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: space.lg, gap: space.md, alignItems: 'center' }}>
            {web ? (
              <Text style={[type.body, { color: t.ink, textAlign: 'center' }]}>{tr('log.scanWeb')}</Text>
            ) : !permission?.granted ? (
              <>
                <Text style={[type.body, { color: t.ink, textAlign: 'center' }]}>{tr('log.camDenied')}</Text>
                <Button icon="camera-outline" label={tr('log.allowCam')} onPress={requestPermission} />
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }} accessibilityLiveRegion="polite">
                {status.kind === 'looking' ? <ActivityIndicator color={t.accent} /> : <Icon name="barcode-outline" size={22} color={t.ink} />}
                <Text style={[type.label, { color: t.ink, flexShrink: 1, textAlign: 'center' }]}>{message}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
