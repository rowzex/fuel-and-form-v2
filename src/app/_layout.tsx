import {
  PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold, useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic, ToastProvider } from '../components/motion';
import { Onboarding } from '../components/onboarding';
import type { IconName } from '../components/ui';
import { StoreProvider, useStore } from '../lib/store';
import { font, useTheme } from '../theme';

/** Outline icon normally, filled when the tab is selected. */
const ICONS: Record<string, IconName> = { index: 'home', log: 'add-circle', recipes: 'restaurant', coach: 'chatbubbles', habits: 'checkmark-circle' };

export default function RootLayout() {
  const [fontsReady] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
    ...Ionicons.font,
  });
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ToastProvider>
          <StatusBar style="auto" />
          <Gate fontsReady={fontsReady} />
        </ToastProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

/** Shows language choice and sign-up until the user has an account, then the app. */
function Gate({ fontsReady }: { fontsReady: boolean }) {
  const t = useTheme();
  const { ready, lang, signedIn, t: tr } = useStore();
  const insets = useSafeAreaInsets();
  if (!ready || !fontsReady) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  if (!lang || !signedIn) return <Onboarding />;
  // Five tabs at most. Calendar and Targets open from buttons on the Today screen.
  const hidden = { tabBarButton: () => null, tabBarItemStyle: { display: 'none' as const } };
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.tap() }}
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'shift',
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line, height: 70 + insets.bottom, paddingTop: 4, paddingBottom: insets.bottom + 6 },
        tabBarLabelStyle: { ...font(600), fontSize: 12, lineHeight: 16 },
        tabBarIcon: ({ color, focused }) => {
          const name = ICONS[route.name] ?? 'ellipse';
          return <Ionicons name={(focused ? name : `${name}-outline`) as IconName} size={24} color={color as string} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: tr('tab.today') }} />
      <Tabs.Screen name="log" options={{ title: tr('tab.log') }} />
      <Tabs.Screen name="recipes" options={{ title: tr('tab.recipes') }} />
      <Tabs.Screen name="coach" options={{ title: tr('tab.coach') }} />
      <Tabs.Screen name="habits" options={{ title: tr('tab.habits') }} />
      {/* Not tabs. (`href: null` would block navigating to them.) */}
      <Tabs.Screen name="calendar" options={{ title: tr('tab.calendar'), ...hidden }} />
      <Tabs.Screen name="profile" options={{ title: tr('tab.targets'), ...hidden }} />
    </Tabs>
  );
}
