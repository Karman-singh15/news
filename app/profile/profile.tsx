import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../_layout';

export default function Profile() {
    const router = useRouter();
    const { session } = useAuth();

    const [uploading, setUploading] = useState(false);

    // Try to find the avatar from custom upload, or fallback to Google/Apple identity
    const userMetadata = session?.user?.user_metadata;
    const identityData = session?.user?.identities?.[0]?.identity_data;
    const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture || identityData?.avatar_url || identityData?.picture;

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setUploading(true);
                const asset = result.assets[0];

                const fileExt = asset.uri.split('.').pop() || 'jpeg';
                const fileName = `${session?.user?.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri,
                    name: fileName,
                    type: asset.mimeType ?? 'image/jpeg',
                } as any);

                // Upload to Supabase Storage 'avatars' bucket
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, formData);

                if (uploadError) {
                    throw new Error('Upload failed. Ensure you have an "avatars" bucket set to Public in Supabase.\n\nDetails: ' + uploadError.message);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                // Update auth metadata
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: publicUrl }
                });

                if (updateError) throw updateError;
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async () => {
        try {
            setUploading(true);

            // Note: In a production app, you might also want to delete the file from the Supabase Storage bucket 
            // using supabase.storage.from('avatars').remove([filePath]) to save space!

            // Clear the avatar_url in Auth metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: '' }
            });

            if (updateError) throw updateError;
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setUploading(false);
        }
    };

    // Helper to check if the avatar is from a Google/Apple OAuth provider, 
    // so we don't accidentally let them "remove" a social-provided picture, or if you do, it just clears it locally.
    const isCustomUpload = avatarUrl && avatarUrl.includes('supabase');

    const handleEditPhoto = () => {
        const buttons: any[] = [
            { text: "Upload Photo", onPress: pickImage },
            { text: "Cancel", style: "cancel" }
        ];
        if (avatarUrl) {
            buttons.splice(1, 0, { text: "Remove Photo", onPress: removeImage, style: "destructive" });
        }
        Alert.alert("Profile Photo", "Choose an option", buttons, { cancelable: true });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.avatarWrapper}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleEditPhoto} disabled={uploading}>
                        {uploading ? (
                            <View style={styles.loadingAvatar}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                            </View>
                        ) : avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person-circle-outline" size={100} color={Colors.primary} />
                        )}
                        <View style={styles.editIconBadge}>
                            <Ionicons name="pencil" size={16} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.emailText}>{session?.user?.email}</Text>
                </View>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={24} color={Colors.error} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatarWrapper: {
        alignItems: 'center',
        marginTop: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.background,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    loadingAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    emailText: {
        fontSize: 18,
        color: Colors.text,
        marginTop: 16,
        fontWeight: '500',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A0808', // Very dark red indicating danger/logout
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#4A1111',
        marginBottom: 40,
    },
    signOutText: {
        color: Colors.error,
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 12,
    },
});
