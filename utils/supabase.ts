import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * expo-secure-store has a ~2KB limit per value. Supabase tokens can
 * exceed this, so we split large values across indexed chunks.
 */
const CHUNK_SIZE = 1800;

const ExpoSecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        try {
            const numChunksStr = await SecureStore.getItemAsync(`${key}_numChunks`);
            if (!numChunksStr) return await SecureStore.getItemAsync(key);
            const numChunks = parseInt(numChunksStr, 10);
            let value = '';
            for (let i = 0; i < numChunks; i++) {
                value += (await SecureStore.getItemAsync(`${key}_chunk_${i}`)) ?? '';
            }
            return value || null;
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
        try {
            if (value.length <= CHUNK_SIZE) {
                await SecureStore.setItemAsync(key, value);
                return;
            }
            // Split into chunks
            const numChunks = Math.ceil(value.length / CHUNK_SIZE);
            await SecureStore.setItemAsync(`${key}_numChunks`, String(numChunks));
            for (let i = 0; i < numChunks; i++) {
                await SecureStore.setItemAsync(
                    `${key}_chunk_${i}`,
                    value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
                );
            }
        } catch (e) {
            console.warn('[SecureStore] setItem failed:', e);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
        try {
            const numChunksStr = await SecureStore.getItemAsync(`${key}_numChunks`);
            if (numChunksStr) {
                const numChunks = parseInt(numChunksStr, 10);
                await SecureStore.deleteItemAsync(`${key}_numChunks`);
                for (let i = 0; i < numChunks; i++) {
                    await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
                }
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (e) {
            console.warn('[SecureStore] removeItem failed:', e);
        }
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
