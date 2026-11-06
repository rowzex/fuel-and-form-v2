import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { FadeIn, haptic, Pop, useToast } from '../components/motion';
import { Button, Card, DayHeader, Empty, Icon, IconButton, Input, Muted, Ring, Screen, styles } from '../components/ui';
import { habitText, LOCALE } from '../lib/i18n';
import { dateKey, isDone, shiftKey, streak } from '../lib/model';
import { useStore } from '../lib/store';
import { radius, space, TOUCH, type, useTheme } from '../theme';

export default function Habits() {
  const t = useTheme();
  const { profile, days, day, toggleHabit, addHabit, removeHabit, t: tr, lang } = useStore();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const toast = useToast();
  const today = dateKey(new Date());
  const doneCount = profile.habits.filter((h) => isDone(h, day, profile)).length;
  const best = Math.max(0, ...profile.habits.map((h) => streak(h, days, profile)));
  const week = Array.from({ length: 7 }, (_, i) => shiftKey(today, i - 6));
  const letter = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(LOCALE[lang ?? 'en'], { weekday: 'narrow' });
  };

  const submit = () => {
    if (!name.trim()) return;
    addHabit(name.trim());
    haptic.confirm();
    toast(tr('habits.added'));
    setName('');
  };

  return (
    <Screen>
      <DayHeader title={tr('habits.title')} />

      <FadeIn>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1, backgroundColor: t.hero, borderRadius: radius.lg, padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Ring value={doneCount} goal={Math.max(1, profile.habits.length)} size={64} stroke={16} on="hero">
              <Icon name="checkmark" size={22} color={t.heroInk} />
            </Ring>
            <View style={{ flex: 1 }}>
              <Text style={[type.number, { fontSize: 24, color: t.heroInk }]}>{doneCount}/{profile.habits.length}</Text>
              <Text style={[type.caption, { color: t.heroMuted }]} numberOfLines={2}>{tr('habits.count', { d: doneCount, n: profile.habits.length })}</Text>
            </View>
          </View>
          <View style={{ width: 112, backgroundColor: t.surface, borderRadius: radius.lg, padding: space.lg, justifyContent: 'center', gap: 2 }}>
            <Icon name="flame" size={24} color={t.streak} />
            <Text style={[type.number, { fontSize: 24, color: t.ink }]}>{best}d</Text>
          </View>
        </View>
      </FadeIn>

      {profile.habits.length === 0 ? <Card><Empty icon="checkmark-circle-outline" text={tr('habits.empty')} /></Card> : null}
      <View style={[styles.sheet, { backgroundColor: t.surface, display: profile.habits.length ? 'flex' : 'none' }]}>
      <View style={[styles.rowBetween, { paddingHorizontal: space.lg, paddingTop: space.sm }]}>
        <View style={{ flexDirection: 'row', gap: 6, paddingLeft: TOUCH + space.md }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {week.map((k) => (
            <Text key={k} style={[type.caption, { width: 12, textAlign: 'center', color: k === today ? t.accent : t.muted }]}>{letter(k)}</Text>
          ))}
        </View>
        <Button small kind="ghost" icon={editing ? 'checkmark' : 'create-outline'} label={editing ? tr('done') : tr('edit')} onPress={() => setEditing(!editing)} />
      </View>

      {profile.habits.map((h, i) => {
        const on = isDone(h, day, profile);
        const s = streak(h, days, profile);
        const { name: label, note } = habitText(h, tr);
        return (
          <View key={h.id}>
            <View style={{ borderTopWidth: 1, borderTopColor: t.line, paddingHorizontal: space.lg, paddingVertical: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Pressable
                accessibilityRole="checkbox" accessibilityState={{ checked: on, disabled: !!h.auto }} accessibilityLabel={label}
                disabled={!!h.auto}
                onPress={() => {
                  if (!on) {
                    haptic.toggle(true);
                    if (s + 1 >= 2) toast(tr('habits.streak', { n: s + 1, name: label }));
                  } else haptic.toggle(false);
                  toggleHabit(h.id);
                }}
                style={({ pressed }) => ({
                  width: TOUCH, height: TOUCH, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                  borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accent : pressed ? t.raised : 'transparent',
                })}
              >
                <Pop trigger={on}>
                  {on ? <Icon name="checkmark" size={26} color={t.accentInk} /> : h.auto ? <Icon name="flash-outline" size={20} color={t.muted} /> : null}
                </Pop>
              </Pressable>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[type.bodyStrong, { color: t.ink }]}>{label}</Text>
                {note ? <Muted style={{ fontSize: 12 }}>{note}</Muted> : null}
                <View style={{ flexDirection: 'row', gap: 6 }} accessible accessibilityLabel={`${label}: ${week.filter((k) => isDone(h, days[k], profile)).length}/7`}>
                  {week.map((k) => {
                    const done = isDone(h, days[k], profile);
                    return <View key={k} style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: done ? t.ink : t.raised, borderWidth: k === today ? 1.5 : 0, borderColor: t.ink }} />;
                  })}
                </View>
              </View>
              {editing ? (
                <IconButton icon="trash-outline" label={`${tr('delete')} ${label}`} onPress={() => { haptic.toggle(false); removeHabit(h.id); }} />
              ) : (
                <Pop trigger={s}>
                  <View style={{ alignItems: 'center', minWidth: 44 }}>
                    <Icon name={s >= 3 ? 'flame' : 'flame-outline'} size={22} color={s >= 3 ? t.streak : t.muted} />
                    <Text style={[type.label, { color: s >= 3 ? t.ink : t.muted }]}>{s}d</Text>
                  </View>
                </Pop>
              )}
            </View>
          </View>
        );
      })}
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Input
          style={{ flex: 1 }} icon="add-circle-outline" value={name} onChangeText={setName} onSubmitEditing={submit} returnKeyType="done" maxLength={60}
          placeholder={tr('habits.new')} accessibilityLabel={tr('habits.new')}
        />
        <IconButton icon="add" tone="filled" label={tr('add')} onPress={submit} disabled={!name.trim()} />
      </View>
      <Muted>{tr('habits.note')}</Muted>
    </Screen>
  );
}
