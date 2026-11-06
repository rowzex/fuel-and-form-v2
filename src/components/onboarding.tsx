import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthError, GUEST, sendCode, validEmail, verifyCode } from '../lib/auth';
import { deviceLang, Lang, LANGS } from '../lib/i18n';
import { useStore } from '../lib/store';
import { radius, space, type, useTheme } from '../theme';
import { FadeIn, haptic, PressScale } from './motion';
import { Button, Field, Icon, Muted, Screen } from './ui';

/** First launch: pick a language, then sign up or log in with email. */
export function Onboarding() {
  const { lang } = useStore();
  const [step, setStep] = useState<'lang' | 'account'>(lang ? 'account' : 'lang');
  return step === 'lang' ? <LanguageStep onNext={() => setStep('account')} /> : <AccountStep onBack={() => setStep('lang')} />;
}

function Logo() {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="leaf" size={28} color={t.accentInk} />
      </View>
      <Text style={[type.title, { color: t.ink }]}>Fuel & Form</Text>
    </View>
  );
}

function LanguageStep({ onNext }: { onNext: () => void }) {
  const t = useTheme();
  const { lang, setLang, t: tr } = useStore();
  const [picked, setPicked] = useState<Lang>(lang ?? deviceLang());
  const choose = (l: Lang) => { haptic.tap(); setPicked(l); setLang(l); };
  return (
    <Screen>
      <FadeIn>
        <View style={{ gap: space.xl, marginTop: space.xl }}>
          <Logo />
          <View style={{ gap: space.xs }}>
            <Text style={[type.title, { color: t.ink }]} accessibilityRole="header">{tr('ob.chooseLang')}</Text>
            <Muted style={{ fontSize: 15 }}>{tr('ob.langSub')}</Muted>
          </View>
        </View>
      </FadeIn>
      <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
        {LANGS.map((l, i) => {
          const on = l.code === picked;
          return (
            <FadeIn key={l.code} delay={60 + i * 40}>
              <PressScale
                onPress={() => choose(l.code)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={l.name}
                style={{
                  minHeight: 64, paddingHorizontal: space.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: on ? t.accent : t.line,
                  backgroundColor: on ? t.accentSoft : t.surface, flexDirection: 'row', alignItems: 'center', gap: space.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[type.bodyStrong, { color: t.ink, fontSize: 17 }]}>{l.name}</Text>
                  <Text style={[type.small, { color: t.muted }]}>{l.hello}</Text>
                </View>
                <Icon name={on ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={on ? t.accent : t.line} />
              </PressScale>
            </FadeIn>
          );
        })}
      </View>
      <Button icon="arrow-forward" label={tr('ob.continue')} onPress={() => { setLang(picked); onNext(); }} />
    </Screen>
  );
}

function AccountStep({ onBack }: { onBack: () => void }) {
  const t = useTheme();
  const { t: tr, account, signIn } = useStore();
  const [name, setName] = useState(account?.name ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fail = (e: unknown) => setError(e instanceof AuthError ? tr(`ob.${e.code}`) : tr('ob.offline'));

  const send = async () => {
    setError('');
    if (!validEmail(email)) return setError(tr('ob.badEmail'));
    setBusy(true);
    try {
      await sendCode(email, name);
      haptic.success();
      setCode('');
      setSentTo(email.trim().toLowerCase());
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError('');
    if (code.trim().length < 6) return setError(tr('ob.badCode'));
    setBusy(true);
    try {
      const acc = await verifyCode(sentTo, code, name);
      haptic.success();
      signIn(acc);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const skip = () => { haptic.tap(); signIn(account?.mode === 'cloud' ? account : GUEST); };

  const errorBox = error ? (
    <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', backgroundColor: t.warnSoft, borderRadius: radius.md, padding: space.md }} accessibilityLiveRegion="polite">
      <Icon name="alert-circle-outline" size={20} color={t.warn} />
      <Text style={[type.small, { color: t.warn, flex: 1 }]}>{error}</Text>
    </View>
  ) : null;

  return (
    <Screen>
      <Pressable
        onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel={tr('ob.back')}
        style={({ pressed }) => ({ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, opacity: pressed ? 0.6 : 1 })}
      >
        <Icon name="chevron-back" size={20} color={t.accent} />
        <Text style={[type.label, { color: t.accent }]}>{tr('ob.back').replace(/^‹\s*/, '')}</Text>
      </Pressable>
      <FadeIn key={sentTo ? 'code' : 'email'}>
        <View style={{ gap: space.md }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={sentTo ? 'mail-open-outline' : 'mail-outline'} size={26} color={t.accent} />
          </View>
          <Text style={[type.title, { color: t.ink }]} accessibilityRole="header">{tr('ob.title')}</Text>
          <Muted style={{ fontSize: 15, lineHeight: 22 }}>{sentTo ? tr('ob.codeSent', { email: sentTo }) : tr('ob.sub')}</Muted>
        </View>
      </FadeIn>
      {!sentTo ? (
        <>
          <Field label={tr('ob.nameOptional')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" returnKeyType="next" />
          <Field
            label={tr('ob.email')} value={email} onChangeText={setEmail} placeholder="name@example.com"
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" textContentType="emailAddress"
            returnKeyType="send" onSubmitEditing={send}
          />
          {errorBox}
          <Button icon="paper-plane-outline" label={busy ? '…' : tr('ob.sendCode')} onPress={send} disabled={busy} />
        </>
      ) : (
        <>
          <TextInput
            value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="000000" placeholderTextColor={t.muted}
            accessibilityLabel={tr('ob.code')}
            style={[type.number, { fontSize: 30, letterSpacing: 12, textAlign: 'center', color: t.ink, backgroundColor: t.raised, borderRadius: radius.md, paddingVertical: space.lg, borderWidth: 1.5, borderColor: t.accent }]}
            keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" textContentType="oneTimeCode" autoFocus returnKeyType="go" onSubmitEditing={verify}
          />
          {errorBox}
          <Button icon="checkmark" label={busy ? '…' : tr('ob.verify')} onPress={verify} disabled={busy || code.length < 6} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button small kind="ghost" icon="refresh" label={tr('ob.resend')} onPress={send} disabled={busy} />
            <Button small kind="ghost" label={tr('ob.changeEmail')} onPress={() => { setSentTo(''); setError(''); }} />
          </View>
        </>
      )}
      <View style={{ height: 1, backgroundColor: t.line, marginTop: space.sm }} />
      <Button kind="secondary" label={tr('ob.skip')} onPress={skip} />
      <Muted style={{ fontSize: 12, textAlign: 'center' }}>{tr('ob.skipNote')}</Muted>
    </Screen>
  );
}
