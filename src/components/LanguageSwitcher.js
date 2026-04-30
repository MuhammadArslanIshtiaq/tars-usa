import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../theme/colors';

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
];

const LanguageSwitcher = ({
  value,
  onChange,
  languages = LANGUAGES,
  compact = true,
  triggerStyle,
  triggerTextStyle,
}) => {
  const [visible, setVisible] = useState(false);
  const current = languages.find((lang) => lang.code === value) || languages[0];

  const handleSelect = (code) => {
    onChange(code);
    setVisible(false);
  };

  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, compact && styles.triggerCompact, triggerStyle]}
        onPress={handleOpen}
        activeOpacity={0.7}
        accessibilityLabel={`Language: ${current.name}. Tap to change.`}
        accessibilityRole="button"
      >
        <Text style={[styles.triggerFlag, triggerTextStyle]}>{current.flag}</Text>
        {!compact && (
          <Text style={[styles.triggerLabel, triggerTextStyle]} numberOfLines={1}>
            {current.name}
          </Text>
        )}
        <Ionicons
          name="chevron-down"
          size={compact ? 16 : 18}
          color={triggerTextStyle?.color ?? 'white'}
          style={styles.chevron}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={handleClose} accessibilityLabel="Close language menu" />
        <View style={styles.dropdownContainer} pointerEvents="box-none">
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Select language</Text>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {languages.map((lang) => {
                const isSelected = lang.code === value;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(lang.code)}
                    activeOpacity={0.7}
                    accessibilityLabel={`${lang.name}${isSelected ? ', selected' : ''}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.optionFlag}>{lang.flag}</Text>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {lang.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={COLORS.primary2} style={styles.check} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  triggerCompact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 44,
    justifyContent: 'center',
  },
  triggerFlag: {
    fontSize: 20,
  },
  triggerLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    maxWidth: 80,
  },
  chevron: {
    marginLeft: 2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 16,
    minWidth: 260,
    maxWidth: 320,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  optionSelected: {
    backgroundColor: 'rgba(30, 90, 168, 0.10)',
  },
  optionFlag: {
    fontSize: 24,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: COLORS.primary2,
    fontWeight: '600',
  },
  check: {
    marginLeft: 'auto',
  },
});

export default LanguageSwitcher;
