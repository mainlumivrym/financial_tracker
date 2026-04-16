import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionType } from '../types';

interface CategoryData {
  name: string;
  icon: string;
  type: TransactionType;
}

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (categoryData: CategoryData) => void;
  type: TransactionType;
}

const EMOJI_OPTIONS: string[] = [
  '🍔', '🍕', '🍜', '🍱', '🍰', '☕', '🍷', '🥗',
  '🚗', '🚕', '🚌', '🚇', '✈️', '🚲', '⛽', '🏍️',
  '🛍️', '👔', '👗', '👟', '💄', '🎁', '📱', '💻',
  '🎬', '🎮', '🎵', '🎨', '📚', '⚽', '🏋️', '🎪',
  '📄', '💡', '🏠', '🔧', '📞', '📺', '🌐', '💳',
  '🏥', '💊', '🩺', '🦷', '👓', '🧘', '💆', '🏃',
  '💼', '📊', '💰', '💵', '💸', '📈', '🎓', '🏆',
  '❤️', '🎂', '🌟', '🔥', '⭐', '🌈', '🎯', '📦',
  '🦷','🐶','🐢','🏋️'
];

export default function AddCategoryModal({ visible, onClose, onAdd, type }: AddCategoryModalProps) {
  const [name, setName] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!selectedEmoji) {
      Alert.alert('Error', 'Please select an emoji icon');
      return;
    }

    onAdd({
      name: name.trim(),
      icon: selectedEmoji,
      type
    });

    // Reset form
    setName('');
    setSelectedEmoji('');
  };

  const handleClose = () => {
    setName('');
    setSelectedEmoji('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Custom Category</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#a0a0a0" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Coffee, Groceries"
                placeholderTextColor="#a0a0a0"
                value={name}
                onChangeText={setName}
                maxLength={20}
              />
            </View>

            {/* Emoji Picker */}
            <View style={styles.section}>
              <Text style={styles.label}>Select Icon</Text>
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiButton,
                      selectedEmoji === emoji && styles.emojiButtonSelected
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            {(name || selectedEmoji) && (
              <View style={styles.preview}>
                <Text style={styles.previewLabel}>Preview</Text>
                <View style={styles.previewBox}>
                  <Text style={styles.previewEmoji}>{selectedEmoji || '❓'}</Text>
                  <Text style={styles.previewName}>{name || 'Category Name'}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Add Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              (!name.trim() || !selectedEmoji) && styles.addButtonDisabled
            ]}
            onPress={handleAdd}
            disabled={!name.trim() || !selectedEmoji}
          >
            <Text style={styles.addButtonText}>Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: '#4ecca3',
    backgroundColor: '#2a3e3a',
  },
  emoji: {
    fontSize: 24,
  },
  preview: {
    marginTop: 8,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ecca3',
  },
  previewEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4ecca3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
});
