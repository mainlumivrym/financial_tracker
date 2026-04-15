import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function UserInfo({ navigation }) {
  const { currentUser, logout } = useAuth();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
              navigation.replace('Landing');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
    // TODO: Save to Firebase/Firestore
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={60} color="#4ecca3" />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#a0a0a0"
                />
              ) : (
                <Text style={styles.value}>{name}</Text>
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
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
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
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#4ecca3',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4ecca3',
  },
  changePhotoButton: {
    marginTop: 12,
  },
  changePhotoText: {
    color: '#4ecca3',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 20,
  },
  infoItem: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  helperText: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 4,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a4e',
    marginVertical: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  logoutText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});
