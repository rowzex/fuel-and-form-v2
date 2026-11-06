import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { haptic, useToast } from '../components/motion';
import { Button, Card, Chip, Field, Header, Icon, IconButton, IconName, Input, Muted, Screen } from '../components/ui';
import { AI_SUPPORTED, loadApiKey, saveApiKey } from '../lib/ai';
import { signOut as endSession } from '../lib/auth';
import { LANGS } from '../lib/i18n';
import { ACTIVITY, GOALS, Profile, targets } from '../lib/model';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';

export default function Targets() {
  const t = useTheme();
  const { profile, updateProfile, t: tr, lang, setLang, account, signOut } = useStore();
  const goal = targets(profile);

  const num = (key: 'age' | 'height' | 'weight' | 'waterGoal', label: string) => (
    <Field
      label={label} style={{ flex: 1 }} defaultValue={String(profile[key])} keyboardType="decimal-pad"
      onChangeText={(v) => { const n = Number(v); if (n > 0) updateProfile({ [key]: key === 'waterGoal' ? Math.min(16, Math.round(n)) : n } as Partial<Profile>); }}
    />
  );

  return (
    <Screen>
      <Header
        title={tr('prof.title')}
        right={<IconButton icon="close" label={tr('done')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}
      />

      <View style={{ backgroundColor: t.hero, borderRadius: radius.xl, padding: space.xl, gap: space.md }}>
        <Text style={[type.label, { color: t.heroMuted }]}>{tr('prof.daily')}</Text>
        <Text style={[type.display, { color: t.heroInk }]}>
          {goal.kcal.toLocaleString()} <Text style={[type.h2, { color: t.heroMuted }]}>{tr('kcal')}</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {([[tr('protein'), goal.p, t.heroProtein], [tr('carbs'), goal.c, t.heroCarbs], [tr('fat'), goal.f, t.heroFat]] as const).map(([l, v, c]) => (
            <View key={l} style={{ flex: 1, backgroundColor: t.heroTrack, borderRadius: radius.md, padding: space.md, gap: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
              <Text style={[type.number, { fontSize: 18, color: t.heroInk }]}>{v} g</Text>
              <Text style={[type.caption, { color: t.heroMuted }]}>{l}</Text>
            </View>
          ))}
        </View>
        <Text style={[type.caption, { color: t.heroMuted }]}>{tr('prof.formula')}</Text>
      </View>

      <AiCoachCard />

      <Card title={tr('prof.about')}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip icon="female-outline" label={tr('prof.female')} on={profile.sex === 'f'} onPress={() => updateProfile({ sex: 'f' })} />
          <Chip icon="male-outline" label={tr('prof.male')} on={profile.sex === 'm'} onPress={() => updateProfile({ sex: 'm' })} />
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {num('age', tr('prof.age'))}
          {num('height', tr('prof.height'))}
          {num('weight', tr('prof.weight'))}
        </View>
      </Card>

      <Card title={tr('prof.activity')}>
        <Options
          value={profile.activity} onChange={(activity) => updateProfile({ activity })}
          options={ACTIVITY.map((a, i) => ({ ...a, icon: (['bed-outline', 'walk-outline', 'bicycle-outline', 'barbell-outline'] as IconName[])[i], label: tr(`act.${a.value}` as 'act.1.2') }))}
        />
      </Card>

      <Card title={tr('prof.goal')}>
        <Options
          value={profile.goal} onChange={(g) => updateProfile({ goal: g })}
          options={GOALS.map((g, i) => ({ ...g, icon: (['trending-down-outline', 'trending-down-outline', 'remove-outline', 'trending-up-outline'] as IconName[])[i], label: tr(`goal.${g.value}` as 'goal.0') }))}
        />
      </Card>

      <Card title={tr('prof.water')}>
        {num('waterGoal', tr('prof.glassesDay'))}
      </Card>

      <Card title={tr('prof.language')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {LANGS.map((l) => <Chip key={l.code} label={l.name} on={(lang ?? 'en') === l.code} onPress={() => setLang(l.code)} />)}
        </View>
      </Card>

      {account ? (
        <Card title={tr('prof.account')}>
          {account.mode === 'guest' ? (
            <>
              <Muted>{tr('prof.guest')}</Muted>
              <Button icon="mail-outline" label={tr('prof.createAccount')} onPress={signOut} />
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={[type.h2, { color: t.accent }]}>{(account.name || account.email).slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[type.bodyStrong, { color: t.ink }]}>{account.name}</Text>
                  <Muted>{account.email}</Muted>
                </View>
              </View>
              <Muted>{tr('prof.localNote')}</Muted>
              <Button kind="danger" icon="log-out-outline" label={tr('prof.signOut')} onPress={async () => { await endSession(); signOut(); }} />
            </>
          )}
        </Card>
      ) : null}
    </Screen>
  );
}

function Options<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string; icon?: IconName }[]; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)} onPress={() => { onChange(o.value); }} accessibilityRole="radio" accessibilityState={{ checked: on }}
            style={({ pressed }) => ({
              minHeight: 52, paddingHorizontal: space.md, borderRadius: radius.md, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: space.md,
              borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentSoft : pressed ? t.raised : 'transparent',
            })}
          >
            {o.icon ? <Icon name={o.icon} size={20} color={on ? t.accent : t.muted} /> : null}
            <Text style={[on ? type.label : type.small, { color: t.ink, flex: 1, fontSize: 14 }]}>{o.label}</Text>
            <Icon name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? t.accent : t.muted} />
          </Pressable>
        );
      })}
    </View>
  );
}

function AiCoachCard() {
  const t = useTheme();
  const toast = useToast();
  const { t: tr } = useStore();
  const [hasKey, setHasKey] = useState(false);
  const [draft, setDraft] = useState('');

  useFocusEffect(useCallback(() => { loadApiKey().then((k) => setHasKey(!!k)); }, []));

  const badge = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: hasKey ? t.accentSoft : t.raised }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: hasKey ? t.accent : t.muted }} />
      <Text style={[type.caption, { color: hasKey ? t.accent : t.muted }]}>{hasKey ? 'On' : 'Off'}</Text>
    </View>
  );

  if (!AI_SUPPORTED)
    return (
      <Card title={tr('ai.title')} right={badge}>
        <Muted>{tr('ai.phoneOnly')}</Muted>
      </Card>
    );

  const save = async () => {
    const key = draft.trim();
    if (!key.startsWith('sk-ant-')) {
      toast(tr('ai.badKey'));
      return;
    }
    await saveApiKey(key);
    setDraft('');
    setHasKey(true);
    haptic.confirm();
    toast(tr('ai.isOn'));
  };

  return (
    <Card title={tr('ai.title')} right={badge}>
      {hasKey ? (
        <>
          <Muted>{tr('ai.on')}</Muted>
          <Button kind="secondary" icon="trash-outline" label={tr('ai.remove')} onPress={async () => { await saveApiKey(null); setHasKey(false); toast(tr('ai.removed')); }} />
        </>
      ) : (
        <>
          <Muted>{tr('ai.off')}</Muted>
          <Input icon="key-outline" value={draft} onChangeText={setDraft} placeholder="sk-ant-…" accessibilityLabel="API key" autoCapitalize="none" autoCorrect={false} secureTextEntry />
          <Button icon="sparkles-outline" label={tr('ai.turnOn')} onPress={save} disabled={!draft.trim()} />
        </>
      )}
    </Card>
  );
}
