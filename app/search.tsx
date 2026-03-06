import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

// Mock data for latest news
const LATEST_NEWS = [
    { id: '1', title: 'Global Markets Rally as Inflation Cools', category: 'economical', time: '2 hours ago' },
    { id: '2', title: 'New Tech Innovations Unveiled in Silicon Valley', category: 'global', time: '4 hours ago' },
    { id: '3', title: 'Championship Finals: A Historic Victory', category: 'sports', time: '6 hours ago' },
];

const HISTORY_KEY = 'TRIV_SEARCH_HISTORY';

export default function Search() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const stored = await SecureStore.getItemAsync(HISTORY_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load search history', e);
        }
    };

    const saveHistory = async (newHistory: string[]) => {
        try {
            await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.warn('Failed to save search history', e);
        }
    };

    const handleSearch = () => {
        const trimmed = query.trim();
        if (!trimmed) return;

        let newHistory = history.filter(item => item !== trimmed);
        newHistory.unshift(trimmed);
        if (newHistory.length > 10) newHistory = newHistory.slice(0, 10);

        setHistory(newHistory);
        saveHistory(newHistory);

        // Normally we'd fetch actual search results here, but for now just clear keyboard
        Keyboard.dismiss();
    };

    const removeHistoryItem = (itemToRemove: string) => {
        const newHistory = history.filter(item => item !== itemToRemove);
        setHistory(newHistory);
        saveHistory(newHistory);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for news..."
                        placeholderTextColor={Colors.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoFocus={true}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Search History */}
                {history.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Searches</Text>
                        </View>
                        <View style={styles.historyList}>
                            {history.map((item, index) => (
                                <View key={index} style={styles.historyItem}>
                                    <TouchableOpacity
                                        style={styles.historyTextContainer}
                                        onPress={() => {
                                            setQuery(item);
                                        }}
                                    >
                                        <Ionicons name="time-outline" size={20} color={Colors.textSecondary} style={styles.historyIcon} />
                                        <Text style={styles.historyText}>{item}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => removeHistoryItem(item)} style={styles.historyRemoveBtn}>
                                        <Ionicons name="close" size={20} color={Colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Latest News */}
                <View style={[styles.section, { marginTop: history.length > 0 ? 32 : 16 }]}>
                    <Text style={styles.sectionTitle}>Latest News</Text>
                    <View style={styles.newsList}>
                        {LATEST_NEWS.map((news) => (
                            <TouchableOpacity key={news.id} style={styles.newsCard}>
                                <View style={styles.newsContent}>
                                    <Text style={styles.newsCategory}>{news.category.toUpperCase()}</Text>
                                    <Text style={styles.newsTitle} numberOfLines={2}>{news.title}</Text>
                                    <Text style={styles.newsTime}>{news.time}</Text>
                                </View>
                                <View style={styles.newsImagePlaceholder}>
                                    <Ionicons name="image-outline" size={32} color={Colors.textSecondary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: Colors.text,
        fontSize: 16,
        height: '100%',
    },
    clearButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    historyList: {
        gap: 16,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    historyTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    historyIcon: {
        marginRight: 12,
    },
    historyText: {
        color: Colors.text,
        fontSize: 16,
    },
    historyRemoveBtn: {
        padding: 4,
    },
    newsList: {
        gap: 16,
    },
    newsCard: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
        gap: 16,
    },
    newsContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    newsCategory: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    newsTitle: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        marginBottom: 8,
    },
    newsTime: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    newsImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
