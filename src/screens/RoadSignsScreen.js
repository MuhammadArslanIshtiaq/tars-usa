import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  InteractionManager,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../components/Header';
import LanguageSwitcher, { LANGUAGES as ALL_LANGUAGES } from '../components/LanguageSwitcher';
import { useAdTriggerFallback } from '../contexts/AdTriggerFallbackContext';
import { useAdMob } from '../hooks/useAdMob';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors';
import { resolveImageSource } from '../utils/resolveImageSource';
import { getDownloadedLanguageCodes, isBundledLanguage } from '../utils/languagePacks';
import { loadMobileQuizAsync } from '../utils/usQuizLoaderAsync';

const SIGN_CATEGORIES = [
  {
    id: 'regulatory',
    title: 'Regulatory Signs',
    slug: 'regulatory-signs',
    icon: 'hand-left-outline',
    color: '#ef4444',
    description: 'Must-follow signs and road rules.',
  },
  {
    id: 'warning',
    title: 'Warning Signs',
    slug: 'warning-signs',
    icon: 'warning-outline',
    color: '#f59e0b',
    description: 'Hazards and caution signs.',
  },
  {
    id: 'railroad',
    title: 'Railroad Crossing Signs',
    slug: 'railroad-crossing-signs',
    icon: 'train-outline',
    color: '#0f172a',
    description: 'Safe behavior near tracks and crossings.',
  },
  {
    id: 'temporary',
    title: 'Temporary Traffic Control Signs',
    slug: 'temporary-traffic-control-signs',
    icon: 'construct-outline',
    color: '#f97316',
    description: 'Work zones and temporary controls.',
  },
];

const RoadSignsScreen = ({ navigation }) => {
  const { preferences, updatePreferences } = useUser();
  const { showAdAndWaitForClose } = useAdMob();
  const { presentAdTrigger } = useAdTriggerFallback();
  const exitingCategoryForAdRef = useRef(false);
  const [selectedLanguage, setSelectedLanguage] = useState(preferences?.language || 'en');
  const [availableLanguages, setAvailableLanguages] = useState(
    ALL_LANGUAGES.filter((l) => isBundledLanguage(l.code))
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setSelectedLanguage(preferences?.language || 'en');
  }, [preferences?.language]);

  useEffect(() => {
    const loadAvailable = async () => {
      const downloaded = await getDownloadedLanguageCodes();
      const allow = new Set(['en', 'es', ...downloaded]);
      setAvailableLanguages(ALL_LANGUAGES.filter((l) => allow.has(l.code)));
    };
    loadAvailable();
  }, []);

  const handleChangeLanguage = async (nextLanguage) => {
    setSelectedLanguage(nextLanguage);
    try {
      await updatePreferences({ language: nextLanguage });
    } catch {
      // ignore
    }
  };

  const isRTL = selectedLanguage === 'ar' || selectedLanguage === 'ur';

  const exitSignCategory = useCallback(() => {
    setSelectedCategory(null);
    setQuestions([]);
    setLoading(false);
  }, []);

  const handleBackFromSignCategory = useCallback(() => {
    if (exitingCategoryForAdRef.current) {
      return;
    }
    exitingCategoryForAdRef.current = true;
    InteractionManager.runAfterInteractions(() => {
      Promise.resolve(presentAdTrigger(showAdAndWaitForClose, { timeoutMs: 8000 }))
        .catch(() => {})
        .finally(() => {
          exitingCategoryForAdRef.current = false;
          exitSignCategory();
        });
    });
  }, [exitSignCategory, presentAdTrigger, showAdAndWaitForClose]);

  const handleBackPress = () => {
    if (selectedCategory) {
      handleBackFromSignCategory();
      return;
    }
    navigation.goBack();
  };

  useEffect(() => {
    if (!selectedCategory) {
      return undefined;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackFromSignCategory();
      return true;
    });
    return () => sub.remove();
  }, [selectedCategory, handleBackFromSignCategory]);

  const handleOpenCategory = async (cat) => {
    const state = preferences?.state || 'Alabama';
    const category = preferences?.category || 'car';
    const language = preferences?.language || 'en';

    setSelectedCategory(cat);
    setLoading(true);
    setQuestions([]);

    try {
      const quiz = await loadMobileQuizAsync({ category, state, slug: cat.slug, language });
      setQuestions(Array.isArray(quiz?.questions) ? quiz.questions : []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory) return;
    if (loading) return;
    (async () => {
      await handleOpenCategory(selectedCategory);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.language]);

  const renderHeaderRight = () => (
    <View style={styles.headerRight}>
      <LanguageSwitcher
        value={selectedLanguage}
        onChange={handleChangeLanguage}
        languages={availableLanguages}
        compact
        triggerStyle={styles.languageButton}
        triggerTextStyle={{ color: 'white' }}
      />
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleBackPress}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryTile = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryTile, { borderLeftColor: item.color }]}
      onPress={() => handleOpenCategory(item)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
    >
      <View style={styles.tileContent}>
        <View style={[styles.tileIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={30} color="white" />
        </View>
        <View style={styles.tileText}>
          <Text style={styles.tileTitle}>{item.title}</Text>
          <Text style={styles.tileDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  const renderQuestionCard = ({ item, index }) => {
    const imageSource = resolveImageSource(item?.image);
    const options = Array.isArray(item?.options) ? item.options : [];
    const correct = options.find((o) => o?.is_correct === true);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIndex}>
            {index + 1} / {questions.length}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SIGN</Text>
          </View>
        </View>

        <View style={styles.imageWrap}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={34} color="#94a3b8" />
              <Text style={styles.imagePlaceholderText}>Image unavailable</Text>
            </View>
          )}
        </View>

        <Text style={[styles.questionText, isRTL ? styles.rtlText : null]}>{item?.question || ' '}</Text>

        <View style={styles.answerRow}>
          <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
          <Text style={[styles.answerText, isRTL ? styles.rtlText : null]}>{correct?.text || ' '}</Text>
        </View>

        {!!item?.explanation && (
          <View style={styles.explainBox}>
            <Text style={[styles.explainTitle, isRTL ? styles.rtlText : null]}>Explanation</Text>
            <Text style={[styles.explainText, isRTL ? styles.rtlText : null]}>{item.explanation}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Header customSubtitle={selectedCategory?.title || 'Road Signs'} titleOnly>
        {renderHeaderRight()}
      </Header>

      {!selectedCategory ? (
        <FlatList
          data={SIGN_CATEGORIES}
          renderItem={renderCategoryTile}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.headerSubtitle}>Choose a sign category</Text>
            </View>
          }
        />
      ) : loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          renderItem={renderQuestionCard}
          keyExtractor={(item, idx) => String(item?.id || idx)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.headerSubtitle}>Signs with explanations</Text>
              <Text style={styles.smallMeta}>{questions.length} items</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 8, marginLeft: 8 },
  languageButton: { marginRight: 4 },

  listContainer: { padding: 16, paddingBottom: 28 },
  listHeader: { marginBottom: 12 },
  headerSubtitle: { fontSize: 14, fontWeight: '700', color: '#475569' },
  smallMeta: { marginTop: 6, fontSize: 12, fontWeight: '700', color: '#64748b' },

  categoryTile: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  tileContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tileText: { flex: 1, paddingRight: 10 },
  tileTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  tileDescription: { fontSize: 13, fontWeight: '600', color: '#64748b', lineHeight: 18 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  loadingText: { fontSize: 14, fontWeight: '700', color: '#475569' },

  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIndex: { fontSize: 12, fontWeight: '800', color: '#64748b' },
  badge: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#64748b' },

  imageWrap: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    height: 160,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  imagePlaceholderText: { fontSize: 12, fontWeight: '800', color: '#94a3b8' },

  questionText: { marginTop: 10, fontSize: 15, fontWeight: '800', color: '#0f172a', lineHeight: 21 },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  answerText: { flex: 1, fontSize: 14, fontWeight: '800', color: '#166534', lineHeight: 20 },

  explainBox: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  explainTitle: { fontSize: 12, fontWeight: '900', color: COLORS.primary2, marginBottom: 6 },
  explainText: { fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 18 },

  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});

export default RoadSignsScreen;
