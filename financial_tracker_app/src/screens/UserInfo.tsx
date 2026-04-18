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

type Props = NativeStackScreenProps<RootStackParamList, 'UserInfo'>;

export default function UserInfo({ navigation }: Props) {
  const { currentUser, logout } = useAuth();
  const styles = useUserInfoStyles();
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
      Alert.alert('Permission Denied', 'We need camera roll permissions to change your profile picture.');
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
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#4ecca3" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Profile</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => isEditing ? handleSave() : setIsEditing(true)}
      >
        <Text style={styles.editButtonText}>
          {isEditing ? 'Save' : 'Edit'}
        </Text>
      </TouchableOpacity>
    </View>
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
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAccountInfo = () => (
    <View style={styles.infoCard}>
      <View style={styles.infoItem}>
        <Text style={styles.label}>Username</Text>
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
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>
        <Text style={styles.helperText}>Email cannot be changed</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoItem}>
        <Text style={styles.label}>Phone Number</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor="#a0a0a0"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{phone || 'Not set'}</Text>
        )}
      </View>
    </View>
  );

  const renderAppearanceSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Appearance</Text>

      <View style={styles.infoCard}>
        <ThemeSwitcher />
      </View>
    </View>
  );

  const renderAccountSettings = () => (

    <View style={styles.infoCard}>
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="lock-closed-outline" size={24} color="#4ecca3" />
          <Text style={styles.settingText}>Change Password</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#a0a0a0" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={24} color="#4ecca3" />
          <Text style={styles.settingText}>Notifications</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#a0a0a0" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#4ecca3" />
          <Text style={styles.settingText}>Privacy & Security</Text>
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
      <Text style={styles.logoutText}>Logout</Text>
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
          <Text style={styles.sectionTitle}>Account Information</Text>
          {renderAccountInfo()}
        </View>

        {/* Appearance Settings */}
        {renderAppearanceSettings()}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {renderAccountSettings()}
        </View>

        {/* Logout Button */}
        {renderLogoutButton()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}