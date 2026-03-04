import { Session } from "@supabase/supabase-js";
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../utils/supabase";

// ─── Auth Context ─────────────────────────────────────────────────────────────
// Provides session to any screen that needs it via useAuth()
type AuthContextType = { session: Session | null; initialized: boolean };
const AuthContext = createContext<AuthContextType>({ session: null, initialized: false });
export const useAuth = () => useContext(AuthContext);

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 1. Load persisted session — wrapped in try/catch so AsyncStorage
    //    errors (e.g. in Expo Go) don't leave `initialized` stuck at false.
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((e) => {
        console.warn('[Auth] getSession error (treating as no session):', e);
      })
      .finally(() => {
        setInitialized(true);
      });

    // 2. Keep session in sync with Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true); // fallback in case getSession() never resolved
    });

    // 3. Handle OAuth deep-link callback (exp://... or news://...)
    //    Supabase appends #access_token=...&refresh_token=... to the redirect URL
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      try {
        const fragment = url.split('#')[1] || url.split('?')[1] || '';
        const params = new URLSearchParams(fragment);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      } catch (e) {
        console.error('[Auth] Deep link error:', e);
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const linkSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  // 4. Route guard — runs whenever session or location changes
  useEffect(() => {
    if (!initialized) return;

    const inAuthScreen = segments[0] === 'auth';

    if (session && inAuthScreen) {
      // Signed-in user ended up on an auth screen → send them home
      router.replace('/');
    } else if (!session && !inAuthScreen) {
      // Unauthenticated user on a protected screen → send to sign-in
      router.replace('/auth/signin');
    }
  }, [session, initialized, segments]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ session, initialized }}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthContext.Provider>
  );
}
