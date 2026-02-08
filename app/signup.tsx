import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthButton } from '../components/AuthButton';
import { AuthInput } from '../components/AuthInput';
import { Colors } from '../constants/colors';

export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDobChange = (text: string) => {
        // Remove non-numeric characters
        const cleaned = text.replace(/[^0-9]/g, '');

        // Format as DD/MM/YYYY
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        if (cleaned.length > 4) {
            formatted = `${formatted.slice(0, 5)}/${cleaned.slice(4, 8)}`;
        }

        setDob(formatted);
    };

    const handleSignUp = () => {
        // Basic Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // DOB Validation
        const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!dobRegex.test(dob)) {
            Alert.alert('Error', 'Please enter a valid Date of Birth (DD/MM/YYYY)');
            return;
        }

        // Check for real date
        const [day, month, year] = dob.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        if (
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
        ) {
            Alert.alert('Error', 'Please enter a valid Date of Birth');
            return;
        }


        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        // Mock Auth Logic
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Account created successfully!');
            setName('');
            setDob('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            router.replace('/signin' as any);
        }, 1500);
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




                                <AuthButton
                                    title="Continue with Google"
                                    onPress={() => Alert.alert('Google Sign Up', 'This is a mock Google Sign Up')}
                                    variant="google"
                                    icon={<Ionicons name="logo-google" size={20} color={Colors.text} />}
                                />
                                <AuthButton
                                    title="Continue with Apple"
                                    onPress={() => Alert.alert('Apple Sign Up', 'This is a mock Apple Sign Up')}
                                    variant="apple"
                                    icon={<Ionicons name="logo-apple" size={20} color={Colors.text} />}
                                />

                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

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
                                    placeholder="Create a password"
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
