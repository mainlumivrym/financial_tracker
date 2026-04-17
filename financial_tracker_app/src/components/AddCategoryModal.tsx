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
import { colors } from '../styles';

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
  '🦷', '🐶', '🐢', '🏋️'
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

  const renderCategoryNameField = () => (
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
  )

  const renderEmojiPicker = () => (
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
  )

  const renderPreview = () => (
    <View style={styles.preview}>
      <Text style={styles.previewLabel}>Preview</Text>
      <View style={styles.previewBox}>
        <Text style={styles.previewEmoji}>{selectedEmoji || '❓'}</Text>
        <Text style={styles.previewName}>{name || 'Category Name'}</Text>
      </View>
    </View>
  )

  const renderAddButton = () => (
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
  )

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
            {renderCategoryNameField()}

            {/* Emoji Picker */}
            {renderEmojiPicker()}

            {/* Preview */}
            {(name || selectedEmoji) && (
              renderPreview()
            )}
          </ScrollView>

          {/* Add Button */}
          {renderAddButton()}
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
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
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
    color: colors.textSecondary,
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  previewEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
});
