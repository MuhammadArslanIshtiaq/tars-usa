import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../components/Header';
import ShareApp from '../components/ShareApp';
import { useUser } from '../contexts/UserContext';
import { useAdMob } from '../hooks/useAdMob';
import { getAllStatesForCategory, getQuizListFor, SUPPORTED_LANGUAGES } from '../utils/usQuizLoader';
import { loadMobileQuizAsync } from '../utils/usQuizLoaderAsync';
import { downloadAndInstallLanguagePack, isBundledLanguage, isLanguagePackDownloaded } from '../utils/languagePacks';
import { COLORS } from '../theme/colors';

// Session-based ad tracking (resets when app is closed/opened)
let learningMaterialAdShownThisSession = false;

const HomeScreen = ({ navigation, route }) => {
  const { username, preferences, updatePreferences } = useUser();
  const { showAd } = useAdMob();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [expandedKey, setExpandedKey] = useState(null);
  const [activePrefPicker, setActivePrefPicker] = useState(null); // 'state' | 'category' | 'language' | null
  const [stateSearch, setStateSearch] = useState('');
  const [downloadedLang, setDownloadedLang] = useState({});
  const [downloading, setDownloading] = useState({ code: null, progress: 0 });

  const category = preferences?.category || 'car';
  const stateValue = preferences?.state || '';
  const language = preferences?.language || 'en';

  const CATEGORIES = [
    { id: 'car', label: 'Car', icon: 'car-sport-outline', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
    { id: 'motorcycle', label: 'Motorcycle', icon: 'bicycle-outline', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
    { id: 'cdl', label: 'CDL', icon: 'bus-outline', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  ];

  const allStates = useMemo(() => getAllStatesForCategory(category), [category]);
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return allStates;
    return allStates.filter((st) => st.toLowerCase().includes(q));
  }, [allStates, stateSearch]);

  useEffect(() => {
    const loadDownloaded = async () => {
      if (activePrefPicker !== 'language') return;
      const next = {};
      for (const l of SUPPORTED_LANGUAGES) {
        if (isBundledLanguage(l.code)) next[l.code] = true;
        else next[l.code] = await isLanguagePackDownloaded({ language: l.code });
      }
      setDownloadedLang(next);
    };
    loadDownloaded();
  }, [activePrefPicker]);

  const handleOpenPrefPicker = (picker) => {
    setActivePrefPicker(picker);
    if (picker === 'state') setStateSearch('');
  };

  const handleClosePrefPicker = () => {
    setActivePrefPicker(null);
    setStateSearch('');
  };

  const handleSelectCategory = async (nextCategory) => {
    await updatePreferences({ category: nextCategory });
    handleClosePrefPicker();
  };

  const handleSelectState = async (nextState) => {
    await updatePreferences({ state: nextState });
    handleClosePrefPicker();
  };

  const handleSelectLanguage = async (nextLanguage) => {
    if (!isBundledLanguage(nextLanguage) && !downloadedLang[nextLanguage]) {
      Alert.alert('Download required', 'Please download this language pack first.');
      return;
    }
    await updatePreferences({ language: nextLanguage });
    handleClosePrefPicker();
  };

  const handleDownloadLanguage = async (code) => {
    setDownloading({ code, progress: 0 });
    try {
      await downloadAndInstallLanguagePack(
        { language: code },
        { onProgress: (p) => setDownloading({ code, progress: p }) }
      );
      setDownloadedLang((prev) => ({ ...prev, [code]: true }));
      Alert.alert('Downloaded', 'Language pack installed on your device.');
    } catch (e) {
      Alert.alert('Download failed', e?.message || 'Please try again.');
    } finally {
      setDownloading({ code: null, progress: 0 });
    }
  };

  // Show disclaimer popup only once (after welcome screen or on first launch)
  useEffect(() => {
    const checkDisclaimerShown = async () => {
      try {
        const disclaimerShown = await AsyncStorage.getItem('disclaimerShown');
        console.log('Disclaimer status:', disclaimerShown);
        if (!disclaimerShown) {
          // Add a small delay to ensure screen is fully loaded
          setTimeout(() => {
            setShowDisclaimer(true);
          }, 500);
        }
      } catch (error) {
        console.error('Error checking disclaimer status:', error);
        // If there's an error, show the disclaimer to be safe
        setTimeout(() => {
          setShowDisclaimer(true);
        }, 500);
      }
    };
    
    checkDisclaimerShown();
  }, []);

  // Handle disclaimer close and save to AsyncStorage
  const handleDisclaimerClose = async () => {
    try {
      await AsyncStorage.setItem('disclaimerShown', 'true');
      setShowDisclaimer(false);
    } catch (error) {
      console.error('Error saving disclaimer status:', error);
      setShowDisclaimer(false);
    }
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtonsContainer}>
      <TouchableOpacity
        style={styles.headerIconButton}
        onPress={() => navigation.navigate('Setup', { mode: 'edit' })}
        accessibilityRole="button"
        accessibilityLabel="Change state and category"
      >
        <Ionicons name="options-outline" size={24} color="white" />
      </TouchableOpacity>
      <ShareApp 
        style={styles.shareButton}
        iconSize={28}
        iconColor="white"
      />
    </View>
  );

  const ListHeader = () => (
    <View style={styles.sectionHeader}>
      <View style={styles.prefsRow}>
        <Pressable
          style={styles.prefChip}
          onPress={() => handleOpenPrefPicker('state')}
          accessibilityRole="button"
          accessibilityLabel="Change state"
        >
          <Ionicons name="location-outline" size={16} color="#0B1220" />
          <Text style={styles.prefChipText} numberOfLines={1}>
            {stateValue || 'Select state'}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#64748b" />
        </Pressable>

        <Pressable
          style={styles.prefChip}
          onPress={() => handleOpenPrefPicker('category')}
          accessibilityRole="button"
          accessibilityLabel="Change category"
        >
          <Ionicons
            name={(CATEGORIES.find((c) => c.id === category)?.icon) || 'car-sport-outline'}
            size={16}
            color="#0B1220"
          />
          <Text style={styles.prefChipText} numberOfLines={1}>
            {CATEGORIES.find((c) => c.id === category)?.label || category}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#64748b" />
        </Pressable>

        <Pressable
          style={styles.prefChip}
          onPress={() => handleOpenPrefPicker('language')}
          accessibilityRole="button"
          accessibilityLabel="Change language"
        >
          <Ionicons name="language-outline" size={16} color="#0B1220" />
          <Text style={styles.prefChipText} numberOfLines={1}>
            {(language || 'en').toUpperCase()}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#64748b" />
        </Pressable>
      </View>
    </View>
  );

  const allQuizzes = useMemo(() => {
    const state = preferences?.state || 'Alabama';
    const category = preferences?.category || 'car';
    return getQuizListFor({ category, state });
  }, [preferences?.state, preferences?.category]);

  const getQuizDetails = (slug, totalQuestions) => {
    const questions = typeof totalQuestions === 'number' ? totalQuestions : 0;
    const estMinutes = questions ? Math.max(5, Math.round(questions * 0.55)) : null;

    const isEasy = slug?.startsWith('easy-practice-test');
    const isIntermediate = slug?.startsWith('intermediate-practice-test');
    const isHard = slug?.startsWith('hard-practice-test');
    const isMixedSigns = slug?.startsWith('signs-practice-test');
    const isWarning = slug === 'warning-signs';
    const isRegulatory = slug === 'regulatory-signs';
    const isTemporary = slug === 'temporary-traffic-control-signs';
    const isRailroad = slug === 'railroad-crossing-signs';

    const difficulty =
      (isEasy && 'Easy') ||
      (isIntermediate && 'Intermediate') ||
      (isHard && 'Hard') ||
      ((isMixedSigns || isWarning || isRegulatory || isTemporary || isRailroad) && 'Signs') ||
      'Practice';

    const type =
      (isMixedSigns && 'Mixed signs') ||
      (isWarning && 'Warning signs') ||
      (isRegulatory && 'Regulatory signs') ||
      (isTemporary && 'Work zones') ||
      (isRailroad && 'Railroad crossings') ||
      'General knowledge';

    const metaParts = [];
    if (questions) metaParts.push(`${questions} questions`);
    if (estMinutes) metaParts.push(`~${estMinutes} min`);
    metaParts.push(difficulty);

    return {
      meta: metaParts.join(' • '),
      description:
        difficulty === 'Signs'
          ? `Focus on ${type}.`
          : `DMV-style ${difficulty.toLowerCase()} questions (${type}).`,
    };
  };

  const getGroupConfig = (key) => {
    if (key === 'easy') return { icon: 'leaf-outline', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)', hint: 'Great for beginners' };
    if (key === 'intermediate') return { icon: 'rocket-outline', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)', hint: 'Step it up' };
    if (key === 'hard') return { icon: 'flame-outline', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', hint: 'Challenge mode' };
    if (key === 'sign') return { icon: 'trail-sign-outline', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)', hint: 'Recognize signs fast' };
    return { icon: 'document-text-outline', color: '#111827', bg: 'rgba(17, 24, 39, 0.08)', hint: 'Practice set' };
  };

  const getQuizRowIcon = (slug) => {
    if (slug?.startsWith('easy-practice-test')) return { icon: 'school-outline', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' };
    if (slug?.startsWith('intermediate-practice-test')) return { icon: 'sparkles-outline', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' };
    if (slug?.startsWith('hard-practice-test')) return { icon: 'barbell-outline', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' };
    if (slug?.startsWith('signs-practice-test')) return { icon: 'images-outline', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' };
    if (slug === 'warning-signs') return { icon: 'warning-outline', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' };
    if (slug === 'regulatory-signs') return { icon: 'hand-left-outline', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)' };
    if (slug === 'temporary-traffic-control-signs') return { icon: 'construct-outline', color: '#f97316', bg: 'rgba(249, 115, 22, 0.14)' };
    if (slug === 'railroad-crossing-signs') return { icon: 'train-outline', color: '#0f172a', bg: 'rgba(15, 23, 42, 0.10)' };
    return { icon: 'document-text-outline', color: '#111827', bg: 'rgba(17, 24, 39, 0.08)' };
  };

  const difficultyGroups = useMemo(() => {
    const easy = allQuizzes.filter((q) => q.slug?.startsWith('easy-practice-test'));
    const intermediate = allQuizzes.filter((q) => q.slug?.startsWith('intermediate-practice-test'));
    const hard = allQuizzes.filter((q) => q.slug?.startsWith('hard-practice-test'));
    const signTest = allQuizzes.filter((q) =>
      q.slug?.startsWith('signs-practice-test') ||
      q.slug === 'warning-signs' ||
      q.slug === 'regulatory-signs' ||
      q.slug === 'temporary-traffic-control-signs' ||
      q.slug === 'railroad-crossing-signs'
    );

    return [
      { key: 'easy', title: 'Easy', items: easy },
      { key: 'intermediate', title: 'Intermidiate', items: intermediate },
      { key: 'hard', title: 'Hard', items: hard },
      { key: 'sign', title: 'Sign Test', items: signTest },
    ];
  }, [allQuizzes]);

  const handleToggle = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handleOpenQuiz = async (slug, name) => {
    const state = preferences?.state || 'Alabama';
    const category = preferences?.category || 'car';
    const language = preferences?.language || 'en';

    const quiz = await loadMobileQuizAsync({ category, state, slug, language });
    if (!quiz) {
      Alert.alert('Not available yet', 'This state/category isn’t bundled yet. Please switch state/category in Setup.');
      return;
    }

    // Show interstitial ad only once per session for first quiz start
    try {
      if (!learningMaterialAdShownThisSession) {
        await showAd();
        learningMaterialAdShownThisSession = true;
      }
    } catch (error) {
      // ignore
    }

    navigation.navigate('Quiz', {
      quiz: {
        id: quiz.id,
        title: name || quiz.title,
        questions: quiz.questions,
        meta: quiz.meta,
      },
    });
  };

  const renderQuizRow = ({ item }) => (
    <TouchableOpacity style={styles.quizRow} onPress={() => handleOpenQuiz(item.slug, item.name)} accessibilityRole="button">
      {(() => {
        const details = getQuizDetails(item.slug, item.totalQuestions);
        const leading = getQuizRowIcon(item.slug);
        return (
          <>
            <View style={styles.quizRowLeading}>
              <View style={[styles.quizRowIcon, { backgroundColor: leading.bg }]}>
                <Ionicons name={leading.icon} size={18} color={leading.color} />
              </View>
            </View>
            <View style={styles.quizRowLeft}>
              <Text style={styles.quizRowTitle}>{item.name}</Text>
              <Text style={styles.quizRowMeta}>{details.meta}</Text>
              <Text style={styles.quizRowDescription} numberOfLines={2}>
                {details.description}
              </Text>
            </View>
          </>
        );
      })()}
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  const renderBlock = ({ item }) => {
    const expanded = expandedKey === item.key;
    const empty = item.items.length === 0;
    const group = getGroupConfig(item.key);
    return (
      <View style={styles.block}>
        <TouchableOpacity style={styles.blockHeader} onPress={() => handleToggle(item.key)} accessibilityRole="button">
          <View style={styles.blockHeaderLeft}>
            <View style={[styles.blockIcon, { backgroundColor: group.bg }]}>
              <Ionicons name={group.icon} size={18} color={group.color} />
            </View>
            <View style={styles.blockHeaderText}>
              <Text style={styles.blockTitle}>{item.title}</Text>
              <Text style={styles.blockHint}>{group.hint}</Text>
            </View>
          </View>

          <View style={styles.blockHeaderRight}>
            <View style={styles.blockBadge}>
              <Text style={styles.blockBadgeText}>{item.items.length}</Text>
            </View>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#64748b" />
          </View>
        </TouchableOpacity>
        {expanded && !empty && (
          <FlatList
            data={item.items}
            keyExtractor={(q) => q.slug}
            renderItem={renderQuizRow}
            scrollEnabled={false}
          />
        )}
        {expanded && empty && (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyBlockTitle}>No quizzes found</Text>
            <Text style={styles.emptyBlockText}>
              Try a different state/category.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle="Start Practicing Today"
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={difficultyGroups}
        renderItem={renderBlock}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
      />

      <Modal
        visible={Boolean(activePrefPicker)}
        transparent
        animationType="fade"
        onRequestClose={handleClosePrefPicker}
      >
        <Pressable style={styles.pickerOverlay} onPress={handleClosePrefPicker}>
          <Pressable style={styles.pickerSheet} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {(activePrefPicker === 'state' && 'Select state') ||
                  (activePrefPicker === 'category' && 'Select category') ||
                  (activePrefPicker === 'language' && 'Select language') ||
                  'Select'}
              </Text>
              <Pressable
                style={styles.pickerClose}
                onPress={handleClosePrefPicker}
                accessibilityRole="button"
                accessibilityLabel="Close picker"
              >
                <Ionicons name="close" size={18} color="#0b1220" />
              </Pressable>
            </View>

            {activePrefPicker === 'state' && (
              <>
                <View style={styles.pickerSearchRow}>
                  <Ionicons name="search-outline" size={18} color="#64748b" />
                  <TextInput
                    value={stateSearch}
                    onChangeText={setStateSearch}
                    placeholder="Search states..."
                    placeholderTextColor="#94a3b8"
                    style={styles.pickerSearchInput}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                </View>
                <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
                  {filteredStates.map((st) => {
                    const selected = st === stateValue;
                    return (
                      <Pressable
                        key={st}
                        style={[styles.pickerRow, selected ? styles.pickerRowSelected : null]}
                        onPress={() => handleSelectState(st)}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${st}`}
                      >
                        <Text style={[styles.pickerRowText, selected ? styles.pickerRowTextSelected : null]}>{st}</Text>
                        {selected ? <Ionicons name="checkmark" size={18} color="#2563eb" /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {activePrefPicker === 'category' && (
              <View style={styles.pickerList}>
                {CATEGORIES.map((c) => {
                  const selected = c.id === category;
                  return (
                    <Pressable
                      key={c.id}
                      style={[styles.pickerRow, selected ? styles.pickerRowSelected : null]}
                      onPress={() => handleSelectCategory(c.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${c.label} category`}
                    >
                      <View style={styles.pickerRowLeft}>
                        <View style={[styles.pickerRowIcon, { backgroundColor: c.bg }]}>
                          <Ionicons name={c.icon} size={18} color={c.color} />
                        </View>
                        <Text style={[styles.pickerRowText, selected ? styles.pickerRowTextSelected : null]}>{c.label}</Text>
                      </View>
                      {selected ? <Ionicons name="checkmark" size={18} color="#2563eb" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {activePrefPicker === 'language' && (
              <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
                {SUPPORTED_LANGUAGES.map((l) => {
                  const selected = l.code === language;
                  const available = Boolean(downloadedLang?.[l.code]);
                  const isDownloading = downloading.code === l.code;
                  return (
                    <View key={l.code} style={styles.pickerLangRowWrap}>
                      <Pressable
                        style={[styles.pickerRow, selected ? styles.pickerRowSelected : null]}
                        onPress={() => handleSelectLanguage(l.code)}
                        disabled={!available}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${l.name}`}
                      >
                        <View style={styles.pickerRowLeft}>
                          <View style={[styles.pickerRowIcon, { backgroundColor: 'rgba(37, 99, 235, 0.10)' }]}>
                            <Ionicons name="language-outline" size={18} color="#2563eb" />
                          </View>
                          <View style={styles.pickerLangTextCol}>
                            <Text
                              style={[
                                styles.pickerRowText,
                                selected ? styles.pickerRowTextSelected : null,
                                !available ? styles.pickerRowTextDisabled : null,
                              ]}
                            >
                              {l.name}
                            </Text>
                            <Text style={styles.pickerRowSubText}>
                              {(isBundledLanguage(l.code) && 'Included') || (available && 'Downloaded') || 'Not downloaded'}
                            </Text>
                          </View>
                        </View>

                        {selected ? <Ionicons name="checkmark" size={18} color="#2563eb" /> : null}
                      </Pressable>

                      {!isBundledLanguage(l.code) && !available && (
                        <Pressable
                          style={styles.pickerDownloadButton}
                          onPress={() => handleDownloadLanguage(l.code)}
                          disabled={Boolean(downloading.code)}
                          accessibilityRole="button"
                          accessibilityLabel={`Download ${l.name}`}
                        >
                          {isDownloading ? (
                            <>
                              <ActivityIndicator size="small" color="#ffffff" />
                              <Text style={styles.pickerDownloadButtonText}>
                                {Math.round((downloading.progress || 0) * 100)}%
                              </Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="download-outline" size={16} color="#ffffff" />
                              <Text style={styles.pickerDownloadButtonText}>Download</Text>
                            </>
                          )}
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      
      {/* Disclaimer Popup Modal */}
      <Modal
        visible={showDisclaimer}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDisclaimerClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle-outline" size={32} color="white" style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Important Disclaimer</Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                This app is <Text style={styles.boldText}>NOT affiliated with or endorsed by any official authority</Text>. 
                We provide traffic fines and road sign information for educational and reference purposes only.
              </Text>
              <Text style={styles.modalText}>
                While we strive to keep this information accurate and up-to-date, please verify current information 
                directly with the relevant official authority before making any decisions.
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>For official and most current information, always refer to the official sources.</Text>
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDisclaimerClose}
              >
                <Text style={styles.modalButtonText}>I Understand & Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  welcomeTextUrdu: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  authorityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
  },
  authorityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: 4,
  },
  authorityNameUrdu: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'left',
    marginBottom: 16,
  },
  prefsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  prefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E7ECF4',
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 1,
    maxWidth: '100%',
  },
  prefChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B1220',
    maxWidth: 140,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  pickerSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7ECF4',
    overflow: 'hidden',
    maxHeight: '78%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B1220',
  },
  pickerClose: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7ECF4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  pickerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerSearchInput: {
    flex: 1,
    height: 38,
    fontSize: 14,
    color: '#0B1220',
    fontWeight: '700',
  },
  pickerList: {
    paddingVertical: 6,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerRowSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  pickerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  pickerRowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRowText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1220',
  },
  pickerRowTextSelected: {
    color: '#1d4ed8',
  },
  pickerRowTextDisabled: {
    color: '#94a3b8',
  },
  pickerRowSubText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  pickerLangRowWrap: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  pickerLangTextCol: {
    flex: 1,
  },
  pickerDownloadButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginRight: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerDownloadButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  block: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7ECF4',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  blockHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  blockIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockHeaderText: {
    flex: 1,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1220',
  },
  blockHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  blockHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  blockBadge: {
    minWidth: 28,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3730a3',
  },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quizRowLeading: {
    marginRight: 12,
  },
  quizRowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizRowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  quizRowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1220',
    marginBottom: 3,
  },
  quizRowMeta: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  quizRowDescription: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    fontWeight: '600',
  },
  emptyBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emptyBlockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  emptyBlockText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 30,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionTitleArabic: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryTitleArabic: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#888',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    backgroundColor: COLORS.primary2,
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    textAlign: 'left',
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary2,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default HomeScreen; 