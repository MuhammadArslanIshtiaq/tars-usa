import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors';
import { BUNDLED_STATE_BY_CATEGORY, getAllStatesForCategory, SUPPORTED_LANGUAGES } from '../utils/usQuizLoader';

const CATEGORIES = [
  { id: 'car', label: 'Car' },
  { id: 'motorcycle', label: 'Motorcycle' },
  { id: 'cdl', label: 'CDL' },
];

const PickerField = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.field} onPress={onPress} accessibilityRole="button">
    <View style={styles.fieldLeft}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={1}>
        {value || 'Select'}
      </Text>
    </View>
    <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
  </TouchableOpacity>
);

const SetupScreen = ({ navigation, route }) => {
  const { preferences, updatePreferences } = useUser();
  const [activePicker, setActivePicker] = useState(null);
  const [stateSearch, setStateSearch] = useState('');
  const isEditMode = route?.params?.mode === 'edit';

  const category = preferences?.category || 'car';
  const stateValue = preferences?.state || '';
  const language = preferences?.language || 'en';

  const allStates = useMemo(() => getAllStatesForCategory(category), [category]);
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return allStates;
    return allStates.filter((st) => st.toLowerCase().includes(q));
  }, [allStates, stateSearch]);
  const languageLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || 'English';
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label || 'Car';

  const handleClose = () => {
    setActivePicker(null);
    setStateSearch('');
  };

  const handlePickCategory = async (nextCategory) => {
    await updatePreferences({ category: nextCategory, state: '' });
    setActivePicker('state');
  };

  const handlePickState = async (nextState) => {
    await updatePreferences({ state: nextState });
    handleClose();
  };

  const handlePickLanguage = async (nextLanguage) => {
    await updatePreferences({ language: nextLanguage });
    handleClose();
  };

  const handleContinue = () => {
    if (!preferences?.state) {
      setActivePicker('state');
      return;
    }
    if (isEditMode) {
      navigation.goBack();
      return;
    }
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        customGreeting={isEditMode ? 'Preferences' : 'Setup'}
        customSubtitle="Choose your state, category, and language"
        pageTitle={isEditMode ? 'Preferences' : 'Setup'}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PickerField label="Category" value={categoryLabel} onPress={() => setActivePicker('category')} />
        <PickerField
          label="State"
          value={stateValue}
          onPress={() => {
            setActivePicker('state');
            setStateSearch('');
          }}
        />
        <PickerField label="Language" value={languageLabel} onPress={() => setActivePicker('language')} />

        {Array.isArray(BUNDLED_STATE_BY_CATEGORY?.[category]) && BUNDLED_STATE_BY_CATEGORY[category].length === 0 && (
          <View style={styles.note}>
            <Text style={styles.noteTitle}>Sample set for now</Text>
            <Text style={styles.noteText}>
              We’ll show the same question set across states while we finish importing all state-specific quizzes.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} accessibilityRole="button">
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!activePicker} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} accessibilityRole="button" />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {activePicker === 'category' ? 'Select category' : activePicker === 'state' ? 'Select state' : 'Select language'}
          </Text>

          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {activePicker === 'category' &&
              CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.option}
                  onPress={() => handlePickCategory(c.id)}
                  accessibilityRole="button"
                >
                  <Text style={styles.optionText}>{c.label}</Text>
                  {c.id === category && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}

            {activePicker === 'state' &&
              (
                <>
                  <View style={styles.searchWrap}>
                    <Ionicons name="search" size={18} color="#666" />
                    <TextInput
                      value={stateSearch}
                      onChangeText={setStateSearch}
                      placeholder="Search state"
                      placeholderTextColor="#888"
                      style={styles.searchInput}
                      autoCorrect={false}
                      autoCapitalize="none"
                      accessibilityLabel="Search state"
                    />
                    {!!stateSearch && (
                      <TouchableOpacity onPress={() => setStateSearch('')} accessibilityRole="button">
                        <Ionicons name="close-circle" size={18} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {filteredStates.map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={styles.option}
                      onPress={() => handlePickState(st)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.optionText}>{st}</Text>
                      {st === stateValue && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                    </TouchableOpacity>
                  ))}

                  {filteredStates.length === 0 && (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsText}>No matches</Text>
                    </View>
                  )}
                </>
              )}

            {activePicker === 'language' &&
              SUPPORTED_LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={styles.option}
                  onPress={() => handlePickLanguage(l.code)}
                  accessibilityRole="button"
                >
                  <Text style={styles.optionText}>{l.name}</Text>
                  {l.code === language && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 28, gap: 12 },
  field: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLeft: { flex: 1, paddingRight: 12 },
  fieldLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  fieldValue: { fontSize: 16, fontWeight: '600', color: '#111' },
  continueButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  note: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
  },
  noteTitle: { fontSize: 14, fontWeight: '800', color: '#111', marginBottom: 4 },
  noteText: { fontSize: 13, color: '#555', lineHeight: 18 },
  continueText: { color: 'white', fontSize: 16, fontWeight: '700' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 120,
    bottom: 80,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalList: { padding: 8 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f3f5f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
    paddingVertical: 0,
  },
  noResults: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  noResultsText: { fontSize: 14, color: '#666', fontWeight: '700' },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: { fontSize: 16, color: '#111', fontWeight: '600' },
});

export default SetupScreen;

