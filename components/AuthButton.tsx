import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Shadows } from '../constants/colors';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'google' | 'apple';
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const AuthButton = ({
    title,
    onPress,
    isLoading = false,
    variant = 'primary',
    style,
    textStyle,
    icon
}: AuthButtonProps) => {

    const getButtonStyle = () => {
        switch (variant) {
            case 'google':
                return styles.googleButton;
            case 'apple':
                return styles.appleButton;
            case 'secondary':
                return styles.secondaryButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'google':
            case 'apple':
            case 'secondary':
                return styles.secondaryButtonText;
            default:
                return styles.primaryButtonText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                variant === 'primary' && Shadows.primary,
                style,
                isLoading && styles.disabledButton // Style change during loading if needed
            ]}
            onPress={onPress}
            disabled={isLoading}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? Colors.text : Colors.background} />
            ) : (
                <>
                    {icon}
                    <Text style={[getTextStyle(), textStyle, icon ? { marginLeft: 8 } : {}]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        marginVertical: 8,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.primaryDark,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.textSecondary,
    },
    googleButton: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: '#333',
    },
    appleButton: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: '#333',
    },
    primaryButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    }
});
