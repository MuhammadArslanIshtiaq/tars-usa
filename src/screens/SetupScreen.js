import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors';
import { BUNDLED_STATE_BY_CATEGORY, getAllStatesForCategory, SUPPORTED_LANGUAGES } from '../utils/usQuizLoader';
import { downloadAndInstallLanguagePack, isBundledLanguage, isLanguagePackDownloaded } from '../utils/languagePacks';

const CATEGORIES = [
  { id: 'car', label: 'Car', icon: 'car-sport-outline', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
  { id: 'motorcycle', label: 'Motorcycle', icon: 'bicycle-outline', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
  { id: 'cdl', label: 'CDL', icon: 'bus-outline', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
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
  const [downloadedLang, setDownloadedLang] = useState({});
  const [downloading, setDownloading] = useState({ code: null, progress: 0 });
  const openPicker = route?.params?.openPicker || null;

  const allStates = useMemo(() => getAllStatesForCategory(category), [category]);
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return allStates;
    return allStates.filter((st) => st.toLowerCase().includes(q));
  }, [allStates, stateSearch]);
  const languageLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || 'English';
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label || 'Car';
  const isSelectionBundled = useMemo(() => {
    const bundledStates = BUNDLED_STATE_BY_CATEGORY?.[category];
    if (!Array.isArray(bundledStates) || bundledStates.length === 0) return false;
    if (!stateValue) return true;
    return bundledStates.includes(stateValue);
  }, [category, stateValue]);

  useEffect(() => {
    const loadDownloaded = async () => {
      if (activePicker !== 'language') return;
      const next = {};
      for (const l of SUPPORTED_LANGUAGES) {
        if (isBundledLanguage(l.code)) {
          next[l.code] = true;
        } else {
          next[l.code] = await isLanguagePackDownloaded({ language: l.code });
        }
      }
      setDownloadedLang(next);
    };
    loadDownloaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePicker]);

  useEffect(() => {
    if (!openPicker) return;
    setActivePicker(openPicker);
    if (openPicker === 'state') setStateSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPicker]);

  const handleClose = () => {
    setActivePicker(null);
    setStateSearch('');
  };

  const handlePickCategory = async (nextCategory) => {
    await updatePreferences({ category: nextCategory });
    handleClose();
  };

  const handlePickState = async (nextState) => {
    await updatePreferences({ state: nextState });
    handleClose();
  };

  const handlePickLanguage = async (nextLanguage) => {
    if (!isBundledLanguage(nextLanguage) && !downloadedLang[nextLanguage]) {
      Alert.alert('Download required', 'Please download this language pack first.');
      return;
    }
    await updatePreferences({ language: nextLanguage });
    handleClose();
  };

  const handleDownloadLanguage = async (code) => {
    console.log('Language pack download pressed:', code);
    setDownloading({ code, progress: 0 });
    try {
      await downloadAndInstallLanguagePack(
        { language: code },
        { onProgress: (p) => setDownloading({ code, progress: p }) }
      );
      setDownloadedLang((prev) => ({ ...prev, [code]: true }));
      Alert.alert('Downloaded', 'Language pack installed on your device.');
    } catch (e) {
      console.log('Language pack download failed:', e);
      Alert.alert('Download failed', e?.message || 'Please try again.');
    } finally {
      setDownloading({ code: null, progress: 0 });
    }
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
        customSubtitle={
          isEditMode
            ? 'Personalize your practice tests — state, vehicle type, and language'
            : 'Pick your state and start practicing'
        }
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

        {!isSelectionBundled && (
          <View style={styles.note}>
            <Text style={styles.noteTitle}>Limited offline dataset</Text>
            <Text style={styles.noteText}>
              Right now only a small sample is bundled in the app. Some state/category selections may show the same quizzes until full state-specific packs are added.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} accessibilityRole="button">
          <Text style={styles.continueText}>{isEditMode ? 'Save' : 'Continue'}</Text>
          <Ionicons name={isEditMode ? 'checkmark' : 'arrow-forward'} size={20} color="white" />
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
                  style={[styles.option, styles.optionWithLeading]}
                  onPress={() => handlePickCategory(c.id)}
                  accessibilityRole="button"
                >
                  <View style={styles.optionLeading}>
                    <View style={[styles.optionIcon, { backgroundColor: c.bg }]}>
                      <Ionicons name={c.icon} size={18} color={c.color} />
                    </View>
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionText}>{c.label}</Text>
                      <Text style={styles.optionSubText}>
                        {c.id === 'car' ? 'Standard DMV tests' : c.id === 'motorcycle' ? 'Motorcycle permit tests' : 'Commercial (CDL) tests'}
                      </Text>
                    </View>
                  </View>
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
              SUPPORTED_LANGUAGES.map((l) => {
                const isSelected = l.code === language;
                const isDownloadingThis = downloading.code === l.code;
                const isAnyDownloading = !!downloading.code;
                const isDownloaded = !!downloadedLang[l.code];

                return (
                  <View key={l.code} style={styles.option}>
                    <View style={styles.languageRow}>
                      <TouchableOpacity
                        style={styles.languageLeftTap}
                        onPress={() => handlePickLanguage(l.code)}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${l.name}`}
                      >
                        <Text style={styles.optionText}>{l.name}</Text>
                      </TouchableOpacity>

                      <View style={styles.languageRight}>
                        {isBundledLanguage(l.code) ? (
                          <View style={styles.pill}>
                            <Text style={styles.pillText}>Included</Text>
                          </View>
                        ) : isDownloaded ? (
                          <View style={[styles.pill, styles.pillDownloaded]}>
                            <Text style={styles.pillTextDownloaded}>Downloaded</Text>
                          </View>
                        ) : (
                          <Pressable
                            style={[
                              styles.downloadBtn,
                              (isDownloadingThis || isAnyDownloading) && styles.downloadBtnDisabled,
                            ]}
                            onPress={() => handleDownloadLanguage(l.code)}
                            accessibilityRole="button"
                            accessibilityLabel={`Download ${l.name}`}
                            disabled={isDownloadingThis || isAnyDownloading}
                            hitSlop={10}
                          >
                            {isDownloadingThis ? (
                              <View style={styles.downloadProgress}>
                                <ActivityIndicator size="small" color="white" />
                                <Text style={styles.downloadText}>{Math.round(downloading.progress * 100)}%</Text>
                              </View>
                            ) : (
                              <>
                                <Ionicons name="download-outline" size={16} color="white" />
                                <Text style={styles.downloadText}>Download</Text>
                              </>
                            )}
                          </Pressable>
                        )}

                        {isSelected && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                      </View>
                    </View>
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FC' },
  content: { padding: 16, paddingBottom: 28, gap: 12 },
  field: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7ECF4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7ECF4',
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
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7', color: '#0B1220' },
  modalList: { padding: 10 },
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
  optionWithLeading: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginBottom: 10,
  },
  optionLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: { flex: 1 },
  optionText: { fontSize: 16, color: '#0B1220', fontWeight: '800' },
  optionSubText: { marginTop: 2, fontSize: 12, color: '#64748b', fontWeight: '600' },
  languageRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  languageLeftTap: {
    flex: 1,
    paddingVertical: 2,
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#e8eef8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontSize: 12, fontWeight: '800', color: '#1e3a8a' },
  pillDownloaded: { backgroundColor: '#dcfce7' },
  pillTextDownloaded: { fontSize: 12, fontWeight: '800', color: '#166534' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  downloadBtnDisabled: { opacity: 0.8 },
  downloadText: { color: 'white', fontSize: 12, fontWeight: '800' },
  downloadProgress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

export default SetupScreen;

