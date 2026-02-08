import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors } from '../constants/colors';

interface AuthInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export const AuthInput = ({ label, error, style, ...props }: AuthInputProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={Colors.textSecondary}
                {...props}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        color: Colors.textSecondary,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.text,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 4,
    },
});
