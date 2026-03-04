import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthButton } from '../components/AuthButton';
import { AuthInput } from '../components/AuthInput';
import { Colors } from '../constants/colors';
import { supabase } from '../utils/supabase';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URL = makeRedirectUri({ preferLocalhost: true });

export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

    const handleDobChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        if (cleaned.length > 4) formatted = `${formatted.slice(0, 5)}/${cleaned.slice(4, 8)}`;
        setDob(formatted);
    };

    // ── Email + Password Sign-Up ───────────────────────────────────────────────
    const handleSignUp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }
        const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!dobRegex.test(dob)) {
            Alert.alert('Error', 'Please enter a valid Date of Birth (DD/MM/YYYY).');
            return;
        }
        const [day, month, year] = dob.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        if (
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
        ) {
            Alert.alert('Error', 'Please enter a valid Date of Birth.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { full_name: name, date_of_birth: dob },
            },
        });

        if (error) {
            Alert.alert('Sign-up failed', error.message);
        } else {
            Alert.alert(
                'Check your email',
                'We sent a confirmation link to ' + email.trim() + '. Click it to activate your account.',
                [{ text: 'OK', onPress: () => router.replace('/signin' as any) }]
            );
        }
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
                        // onAuthStateChange in _layout.tsx navigates home
                    } else {
                        Alert.alert(
                            'Auth Error',
                            'No tokens received. Make sure this URL is in your Supabase redirect list:\n\n' + REDIRECT_URL
                        );
                    }
                }
            }
        } catch (err: any) {
            Alert.alert('Sign-up Error', err.message);
        } finally {
            setOauthLoading(null);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>Sign up to get started</Text>
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

                                {/* Email + Password fields */}
                                <AuthInput
                                    label="Full Name"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                                <AuthInput
                                    label="Date of Birth"
                                    placeholder="DD/MM/YYYY"
                                    value={dob}
                                    onChangeText={handleDobChange}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
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
                                    placeholder="Create a password (min. 6 chars)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <AuthInput
                                    label="Confirm Password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />

                                <AuthButton
                                    title="Sign Up"
                                    onPress={handleSignUp}
                                    isLoading={isLoading}
                                    style={styles.signUpButton}
                                />
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <Link href={"/signin" as any} asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.linkText}>Sign In</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
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
    signUpButton: {
        marginTop: 8,
        marginBottom: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
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
