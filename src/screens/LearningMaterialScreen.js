import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import LanguageSwitcher, { LANGUAGES as ALL_LANGUAGES } from '../components/LanguageSwitcher';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors';

const LearningMaterialScreen = ({ navigation }) => {
  const { username, preferences, updatePreferences } = useUser();
  const [selectedLanguage, setSelectedLanguage] = useState(preferences?.language || 'en');

  const availableLanguages = useMemo(() => {
    return ALL_LANGUAGES;
  }, []);

  useEffect(() => {
    const next = preferences?.language || 'en';
    setSelectedLanguage(next);
  }, [preferences?.language]);

  const getLocalized = (obj) => {
    if (!selectedLanguage || selectedLanguage === 'en') return '';
    return obj?.[selectedLanguage] || '';
  };

  const handleChangeLanguage = async (nextLanguage) => {
    setSelectedLanguage(nextLanguage);
    try {
      await updatePreferences({ language: nextLanguage });
    } catch {
      // ignore
    }
  };

  const learningOptions = [
    {
      id: '0',
      title: 'Tips for Passing the Test',
      titles: {
        ar: 'نصائح لاجتياز الاختبار',
        ur: 'ٹیسٹ پاس کرنے کے لیے ٹپس',
        hi: 'टेस्ट पास करने के टिप्स',
        bn: 'পরীক্ষা পাস করার টিপস',
        es: 'Consejos para aprobar el examen',
        fr: 'Conseils pour réussir l’examen',
        vi: 'Mẹo để vượt qua bài thi',
        zh: '通过考试的技巧',
        ko: '시험 합격 팁',
        tl: 'Mga tip para pumasa sa exam',
      },
      icon: 'bulb-outline',
      description: 'Practical advice for theory + road test day',
      color: '#16a34a',
      onPress: () => navigation.navigate('Tips')
    },
    {
      id: '1',
      title: 'Road Signs',
      titles: {
        ar: 'إشارات الطريق',
        ur: 'روڈ سائنز',
        hi: 'सड़क संकेत',
        bn: 'রাস্তার চিহ্ন',
        es: 'Señales de tránsito',
        fr: 'Panneaux de signalisation',
        vi: 'Biển báo giao thông',
        zh: '交通标志',
        ko: '도로 표지판',
        tl: 'Mga karatula sa kalsada',
      },
      icon: 'warning-outline',
      description: 'Learn all traffic signs and their meanings',
      color: '#e74c3c',
      onPress: () => navigation.navigate('RoadSigns')
    },
    {
      id: '2',
      title: 'Rules',
      titles: {
        ar: 'القواعد واللوائح',
        ur: 'قواعد و ضوابط',
        hi: 'नियम',
        bn: 'নিয়ম',
        es: 'Reglas',
        fr: 'Règles',
        vi: 'Quy tắc',
        zh: '规则',
        ko: '규칙',
        tl: 'Mga tuntunin',
      },
      icon: 'document-text-outline',
      description: 'Study driving rules and regulations',
      color: '#3498db',
      onPress: () => navigation.navigate('RulesContent')
    },
  ];

  const handleBackPress = () => {
    navigation.navigate('Main');
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtonsContainer}>
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
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Learning Material</Text>
      <Text style={styles.sectionTitleLocalized}>
        {getLocalized({
          ar: 'مواد تعليمية',
          ur: 'سیکھنے کا مواد',
          hi: 'सीखने की सामग्री',
          bn: 'শেখার উপকরণ',
          es: 'Material de estudio',
          fr: 'Matériel d’apprentissage',
          vi: 'Tài liệu học',
          zh: '学习资料',
          ko: '학습 자료',
          tl: 'Mga materyal sa pag-aaral',
        }) || ' '}
      </Text>
      <Text style={styles.description}>
        Choose a category to start learning
      </Text>
    </View>
  );

  const renderOptionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={item.onPress}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={32} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>{item.title}</Text>
          <Text style={styles.optionTitleLocalized}>
            {getLocalized(item.titles) || ' '}
          </Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle="Learning Material"
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={learningOptions}
        renderItem={renderOptionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionTitleLocalized: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionTitleLocalized: {
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
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageButton: {
    marginRight: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LearningMaterialScreen;
