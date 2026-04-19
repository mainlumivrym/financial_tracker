import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { RootStackParamList } from '../types';
import useUserInfoStyles from '@/styles/useUserInfoStyles';
import ScreenHeader from '@/components/ScreenHeader';
import { useLocalization } from '@/context/LocalizationContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type Props = NativeStackScreenProps<RootStackParamList, 'UserInfo'>;

export default function UserInfo({ navigation }: Props) {
  const styles = useUserInfoStyles();
  const { t } = useLocalization();

  const { currentUser, logout } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [phone, setPhone] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUsername(profile.username || '');
          setPhone(profile.phone || '');
          setProfilePicture(profile.profilePicture || null);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will happen automatically via AuthContext
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(t('common.permissionDenied'), t('profile.cameraRollPermission'));
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(currentUser.uid, {
        username,
        phone,
        profilePicture
      });
      setIsEditing(false);
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.failedToUpdate'));
      console.error('Error updating profile:', error);
    }
  };

  const renderHeader = () => (
    <ScreenHeader
      title={t('profile.profile')}
      onBackPress={() => navigation.goBack()}
      rightButton={{
        text: isEditing ? t('common.save') : t('common.edit'),
        onPress: () => isEditing ? handleSave() : setIsEditing(true),
      }}
    />
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person" size={60} color="#4ecca3" />
        )}
      </View>
      {isEditing && (
        <TouchableOpacity
          style={styles.changePhotoButton}
          onPress={pickImage}
        >
          <Text style={styles.changePhotoText}>{t('profile.changePhoto')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAccountInfo = () => (
    <View style={styles.infoCard}>
      <View style={styles.infoItem}>
        <Text style={styles.label}>{t('profile.username')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#a0a0a0"
          />
        ) : (
          <Text style={styles.value}>{username}</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.infoItem}>
        <Text style={styles.label}>{t('profile.email')}</Text>
        <Text style={styles.value}>{email}</Text>
        <Text style={styles.helperText}>{t('profile.emailCannotBeChanged')}</Text>
      </View>
    </View>
  );

  const renderAppearanceSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('profile.appearance')}</Text>

      <View style={styles.infoCard}>
        <ThemeSwitcher />
      </View>
    </View>
  );

  const renderLanguageSwitcher = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('profile.language')}</Text>

      <View style={styles.infoCard}>
        <LanguageSwitcher />
      </View>
    </View>
  );

  const renderAccountSettings = () => (

    <View style={styles.infoCard}>
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="lock-closed-outline" size={24} color="#4ecca3" />
          <Text style={styles.settingText}>{t('profile.changePassword')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#a0a0a0" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={24} color="#4ecca3" />
          <Text style={styles.settingText}>{t('profile.notifications')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#a0a0a0" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#4ecca3" />
          <Text style={styles.settingText}>{t('profile.privacyAndSecurity')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#a0a0a0" />
      </TouchableOpacity>
    </View>
  );

  const renderLogoutButton = () => (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={handleLogout}
    >
      <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
      <Text style={styles.logoutText}>{t('profile.logout')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      {renderHeader()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        {renderAvatarSection()}

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.accountInfo')}</Text>
          {renderAccountInfo()}
        </View>

        {/* Appearance Settings */}
        {renderAppearanceSettings()}

        {/* Language Settings */}
        {renderLanguageSwitcher()}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          {renderAccountSettings()}
        </View>

        {/* Logout Button */}
        {renderLogoutButton()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}