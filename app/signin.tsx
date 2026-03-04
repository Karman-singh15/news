import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { AuthButton } from '../components/AuthButton';
import { AuthInput } from '../components/AuthInput';
import { Colors } from '../constants/colors';
import { supabase } from '../utils/supabase';

WebBrowser.maybeCompleteAuthSession();

// Stable redirect URL for Expo Go simulator.
// Add this EXACT URL to Supabase → Authentication → URL Configuration → Redirect URLs:
//   exp://localhost:8081/--/
const REDIRECT_URL = makeRedirectUri({ preferLocalhost: true });

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

    // ── Email + Password ──────────────────────────────────────────────────────
    const handleSignIn = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Error', 'Please enter your email and password.');
            return;
        }
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) Alert.alert('Sign-in failed', error.message);
        // Success → onAuthStateChange in _layout.tsx triggers navigation automatically
        setIsLoading(false);
    };

    // ── OAuth (Google / Apple) ─────────────────────────────────────────────────
    const handleOAuth = async (provider: 'google' | 'apple') => {
        setOauthLoading(provider);
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: REDIRECT_URL,
                    skipBrowserRedirect: true,
                },
            });
            if (error) throw error;

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);

                if (result.type === 'success' && result.url) {
                    // Parse tokens from the redirect URL fragment
                    const fragment = result.url.split('#')[1] || result.url.split('?')[1] || '';
                    const params = new URLSearchParams(fragment);
                    const access_token = params.get('access_token');
                    const refresh_token = params.get('refresh_token');

                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });
                        if (sessionError) throw sessionError;
                        // Session set → onAuthStateChange in _layout navigates to home
                    } else {
                        Alert.alert(
                            'Auth Error',
                            'No tokens received. Make sure this URL is in your Supabase redirect list:\n\n' + REDIRECT_URL
                        );
                    }
                }
                // result.type === 'cancel' → user dismissed browser, do nothing
            }
        } catch (err: any) {
            Alert.alert('Sign-in Error', err.message);
        } finally {
            setOauthLoading(null);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>

                    <View style={styles.form}>
                        {/* OAuth buttons */}
                        <AuthButton
                            title="Continue with Google"
                            onPress={() => handleOAuth('google')}
                            isLoading={oauthLoading === 'google'}
                            variant="google"
                            icon={<Ionicons name="logo-google" size={20} color={Colors.text} />}
                        />
                        <AuthButton
                            title="Continue with Apple"
                            onPress={() => handleOAuth('apple')}
                            isLoading={oauthLoading === 'apple'}
                            variant="apple"
                            icon={<Ionicons name="logo-apple" size={20} color={Colors.text} />}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Email + Password */}
                        <AuthInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <AuthInput
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <AuthButton
                            title="Sign In"
                            onPress={handleSignIn}
                            isLoading={isLoading}
                            style={styles.signInButton}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href={"/signup" as any} asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        backgroundColor: Colors.background,
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    form: {
        marginBottom: 24,
    },
    signInButton: {
        marginTop: 8,
        marginBottom: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.surface,
    },
    dividerText: {
        color: Colors.textSecondary,
        paddingHorizontal: 16,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    footerText: {
        color: Colors.textSecondary,
    },
    linkText: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
});
