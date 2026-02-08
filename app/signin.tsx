import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { AuthButton } from '../components/AuthButton';
import { AuthInput } from '../components/AuthInput';
import { Colors } from '../constants/colors';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = () => {
        setIsLoading(true);
        // Mock Auth Logic
        setTimeout(() => {
            setIsLoading(false);
            setEmail('');
            setPassword('');
            if (email === 'demo' && password === '123') {
                Alert.alert('Success', 'Logged in successfully!');
                // Here you would navigate to the main app
            } else {
                Alert.alert('Error', 'Invalid credentials. Try demo / password');
            }
        }, 1500);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    <View style={styles.form}>
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

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <AuthButton
                            title="Continue with Google"
                            onPress={() => Alert.alert('Google Sign In', 'This is a mock Google Sign In')}
                            variant="google"
                            icon={<Ionicons name="logo-google" size={20} color={Colors.text} />}
                        />
                        <AuthButton
                            title="Continue with Apple"
                            onPress={() => Alert.alert('Apple Sign In', 'This is a mock Apple Sign In')}
                            variant="apple"
                            icon={<Ionicons name="logo-apple" size={20} color={Colors.text} />}
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
