import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import LanguageSwitcher, { LANGUAGES as ALL_LANGUAGES } from '../components/LanguageSwitcher';
import { useUser } from '../contexts/UserContext';
import rulesData from '../data/rules.json';
import { getDownloadedLanguageCodes, isBundledLanguage } from '../utils/languagePacks';

const RulesContentScreen = ({ navigation }) => {
  const { username, preferences, updatePreferences } = useUser();
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(preferences?.language || 'en');
  const [availableLanguages, setAvailableLanguages] = useState(
    ALL_LANGUAGES.filter((l) => isBundledLanguage(l.code))
  );

  useEffect(() => {
    loadRulesData();
  }, [selectedLanguage]);

  useEffect(() => {
    const next = preferences?.language || 'en';
    setSelectedLanguage(next);
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

  const loadRulesData = async () => {
    try {
      setLoading(true);
      // Data is already loaded from import
      setLoading(false);
    } catch (error) {
      console.error('Error loading rules data:', error);
      setLoading(false);
    }
  };

  const getCurrentLanguageData = () => {
    return rulesData.languages[selectedLanguage] || rulesData.languages.en;
  };

  const getTitle = () => {
    return rulesData.title;
  };

  const getIntroduction = () => {
    const current = rulesData.languages?.[selectedLanguage];
    const localizedIntro = current?.introduction;
    return localizedIntro || rulesData.introduction;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtons}>
      <LanguageSwitcher
        value={selectedLanguage}
        onChange={handleChangeLanguage}
        languages={availableLanguages}
        compact
        triggerStyle={styles.languageButton}
        triggerTextStyle={styles.languageTriggerText}
      />
      <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  const isRTL = selectedLanguage === 'ar' || selectedLanguage === 'ur';

  const renderRuleItem = (rule, index) => (
    <View key={index} style={styles.ruleItem}>
      <Text style={[
        styles.ruleText,
        isRTL ? styles.rtlText : null
      ]}>
        {rule}
      </Text>
    </View>
  );

  const renderSection = ({ item, index }) => {
    const currentData = getCurrentLanguageData();
    const section = currentData.sections[index];
    
    return (
      <View key={index} style={styles.sectionContainer}>
        <Text style={[
          styles.sectionTitle,
          isRTL ? styles.rtlText : null
        ]}>
          {section.title}
        </Text>
        <View style={styles.rulesContainer}>
          {section.rules.map((rule, ruleIndex) => 
            renderRuleItem(rule, ruleIndex)
          )}
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={[
        styles.mainTitle,
        isRTL ? styles.rtlText : null
      ]}>
        {getTitle()}
      </Text>
      <Text style={[
        styles.introduction,
        isRTL ? styles.rtlText : null
      ]}>
        {getIntroduction()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header 
          customGreeting="Traffic Rules"
          customSubtitle={rulesData.languages?.[selectedLanguage]?.language_name || 'US Traffic Rules & Regulations'}
          username={username}
          navigation={navigation}
        >
          {renderHeaderRight()}
        </Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a5f3a" />
          <Text style={[
            styles.loadingText,
            isRTL ? styles.rtlText : null
          ]}>
            Loading rules...
          </Text>
        </View>
      </View>
    );
  }

  const currentData = getCurrentLanguageData();
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        customGreeting="Traffic Rules"
        customSubtitle={rulesData.languages?.[selectedLanguage]?.language_name || 'US Traffic Rules & Regulations'}
        username={username}
        navigation={navigation}
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={currentData.sections || []}
        renderItem={renderSection}
        keyExtractor={(item, index) => `section-${index}`}
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  sectionHeader: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5f3a',
    marginBottom: 12,
    textAlign: 'center',
  },
  introduction: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'justify',
  },
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  rulesContainer: {
    marginTop: 8,
  },
  ruleItem: {
    marginBottom: 12,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1a5f3a',
  },
  ruleText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    marginRight: 8,
  },
  languageTriggerText: {
    color: 'white',
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

export default RulesContentScreen;
