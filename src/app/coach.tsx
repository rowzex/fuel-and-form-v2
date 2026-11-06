import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, ScrollViewInstance, Text, View } from 'react-native';

import { FadeIn, haptic, TypingDots } from '../components/motion';
import { RecipeCard, RecipeSheet } from '../components/recipe';
import { Bubble, Button, Header, Icon, IconButton, Input, Muted, Screen } from '../components/ui';
import { AI_SUPPORTED, loadApiKey } from '../lib/ai';
import { answerKey, askCoach, CoachError } from '../lib/coach';
import { LANG_FOR_AI } from '../lib/i18n';
import { Recipe } from '../lib/recipes';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';

const PROMPTS = ['coach.p1', 'coach.p2', 'coach.p3', 'coach.p4', 'coach.p5'] as const;

export default function Coach() {
  const t = useTheme();
  const store = useStore();
  const { profile, days, date, coach, recordAnswer, clearChat, t: tr, lang } = store;
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<Recipe | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const scroller = useRef<ScrollViewInstance>(null);

  useFocusEffect(useCallback(() => { loadApiKey().then(setApiKey); }, []));

  const ask = async (q: string) => {
    const question = q.trim();
    if (busy || !question) return;
    haptic.tap();
    setText('');
    setError('');
    const key = answerKey(question, profile, days, date, lang ?? 'en');
    const same = coach.answers[key];
    if (same) {
      recordAnswer(question, key, same); // same question, same day: same answer
      return;
    }
    setBusy(true);
    try {
      const answer = await askCoach(question, { apiKey, profile, days, date, history: coach.chat, suggested: coach.suggested, usedTips: coach.usedTips, language: LANG_FOR_AI[lang ?? 'en'] });
      recordAnswer(question, key, answer);
      haptic.success();
    } catch (e) {
      setError(e instanceof CoachError ? tr(`err.${e.code}`) : tr('err.other'));
      setText(question);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll={false} onKeyboard={() => scroller.current?.scrollToEnd({ animated: true })}>
      <Header
        title={tr('coach.title')}
        right={coach.chat.length ? <IconButton icon="create-outline" label={tr('coach.newChat')} onPress={clearChat} /> : undefined}
      />
      {!apiKey ? (
        <Pressable
          onPress={() => router.push('/profile')} accessibilityRole="link"
          style={({ pressed }) => ({ flexDirection: 'row', gap: space.md, alignItems: 'center', backgroundColor: t.accentSoft, borderRadius: radius.md, padding: space.md, opacity: pressed ? 0.8 : 1 })}
        >
          <Icon name="key-outline" size={20} color={t.accent} />
          <Text style={[type.small, { color: t.ink, flex: 1 }]}>
            {AI_SUPPORTED ? tr('coach.builtIn') : tr('coach.webBuiltIn')}
            {AI_SUPPORTED ? <Text style={{ color: t.accent }}>{tr('coach.addKey')}</Text> : tr('coach.openPhone')}
          </Text>
        </Pressable>
      ) : null}

      <View style={{ flex: 1, gap: space.md }}>
        <ScrollView
          ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ gap: space.md, paddingBottom: space.sm }} keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        >
          <Bubble role="assistant" text={tr('coach.hello')} />
          <Muted style={{ fontSize: 12, textAlign: 'center' }}>{tr('coach.savedNote')}</Muted>
          {coach.chat.map((m, i) => (
            <FadeIn key={i}>
              <View style={{ gap: space.sm }}>
                <Bubble role={m.role} text={m.content} />
                {m.recipes?.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingLeft: 36 }}>
                    {m.recipes.map((r) => <RecipeCard key={r.id} recipe={r} width={188} onPress={() => { haptic.tap(); setOpen(r); }} />)}
                  </ScrollView>
                ) : null}
              </View>
            </FadeIn>
          ))}
          {busy ? <TypingDots /> : null}
          {error ? (
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', backgroundColor: t.warnSoft, borderRadius: radius.md, padding: space.md }} accessibilityLiveRegion="polite">
              <Icon name="alert-circle-outline" size={20} color={t.warn} />
              <Text style={[type.small, { color: t.warn, flex: 1 }]}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }} style={{ flexGrow: 0, marginHorizontal: -space.lg }}>
          {PROMPTS.map((p) => <Button key={p} label={tr(p)} kind="secondary" small onPress={() => ask(tr(p))} disabled={busy} />)}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <Input
            style={{ flex: 1 }} value={text} onChangeText={setText} onSubmitEditing={() => ask(text)} returnKeyType="send"
            placeholder={tr('coach.placeholder')} accessibilityLabel={tr('coach.placeholder')}
          />
          <IconButton icon="arrow-up" tone="filled" label={tr('coach.send')} onPress={() => ask(text)} disabled={busy || !text.trim()} />
        </View>
      </View>
      <RecipeSheet recipe={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}
