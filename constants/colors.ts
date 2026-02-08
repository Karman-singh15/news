export const Colors = {
    background: '#0F0F0F', // Deep Black
    surface: '#1A1A1A', // Slightly lighter black for cards/inputs
    primary: '#8A2BE2', // BlueViolet (Dark Purple)
    primaryDark: '#4B0082', // Indigo (Deep Purple)
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    error: '#FF4444',
    google: '#DB4437',
    apple: '#FFFFFF',
};

export const Shadows = {
    primary: {
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8, // for Android
    },
    card: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
};
