import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import LanguageSwitcher, { LANGUAGES } from '../components/LanguageSwitcher';
import { useUser } from '../contexts/UserContext';
import { resolveImageSource } from '../utils/resolveImageSource';

// Import sign data
import guideSignsData from '../data/guide-signs.json';
import regulatorySignsData from '../data/regulatory-signs.json';
import roadMarkingData from '../data/road-marking.json';
import warningSignsData from '../data/warning-signs.json';

const RoadSignsScreen = ({ navigation }) => {
  const { username } = useUser();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Sign categories
  const signCategories = [
    {
      id: 'regulatory',
      title: 'Regulatory Road Signs',
      titleUrdu: 'ریگولیٹری روڈ سائنز',
      titleArabic: 'علامات المرور الإلزامية',
      titleHindi: 'नियामक सड़क संकेत',
      titleBengali: 'নিয়ন্ত্রক সড়ক চিহ্ন',
      description: 'Mandatory signs that must be obeyed',
      descriptionUrdu: 'لازمی نشانات جن کی پابندی ضروری ہے',
      descriptionArabic: 'علامات إلزامية يجب الالتزام بها',
      descriptionHindi: 'अनिवार्य संकेत जिनका पालन करना चाहिए',
      descriptionBengali: 'বাধ্যতামূলক চিহ্ন যা অবশ্যই মেনে চলতে হবে',
      icon: 'checkmark-circle',
      color: '#e74c3c',
      data: regulatorySignsData.regulatory,
      imagePath: 'signs/regulatory-road-signs/'
    },
    {
      id: 'warning',
      title: 'Warning Signs',
      titleUrdu: 'انتباہی نشانات',
      titleArabic: 'علامات التحذير',
      titleHindi: 'चेतावनी संकेत',
      titleBengali: 'সতর্কতা চিহ্ন',
      description: 'Signs that warn of potential hazards',
      descriptionUrdu: 'نشانات جو ممکنہ خطرات سے آگاہ کرتے ہیں',
      descriptionArabic: 'علامات تحذر من المخاطر المحتملة',
      descriptionHindi: 'संकेत जो संभावित खतरों की चेतावनी देते हैं',
      descriptionBengali: 'চিহ্ন যা সম্ভাব্য বিপদ সম্পর্কে সতর্ক করে',
      icon: 'warning',
      color: '#f39c12',
      data: warningSignsData.warning,
      imagePath: 'signs/warning-signs/'
    },
    {
      id: 'guide',
      title: 'Guide Signs',
      titleUrdu: 'رہنمائی کے نشانات',
      titleArabic: 'علامات التوجيه',
      titleHindi: 'मार्गदर्शक संकेत',
      titleBengali: 'গাইড চিহ্ন',
      description: 'Informational signs for navigation',
      descriptionUrdu: 'رہنمائی کے لیے معلوماتی نشانات',
      descriptionArabic: 'علامات معلوماتية للملاحة',
      descriptionHindi: 'नेविगेशन के लिए सूचनात्मक संकेत',
      descriptionBengali: 'নেভিগেশনের জন্য তথ্যগত চিহ্ন',
      icon: 'information-circle',
      color: '#3498db',
      data: guideSignsData.guide,
      imagePath: 'signs/guide-signs/'
    },
    {
      id: 'road-marking',
      title: 'Road Marking',
      titleUrdu: 'سڑک کی نشاندہی',
      titleArabic: 'علامات الطريق',
      titleHindi: 'सड़क चिह्न',
      titleBengali: 'সড়ক চিহ্ন',
      description: 'Pavement markings and road lines',
      descriptionUrdu: 'پیمنٹ کی نشاندہی اور سڑک کی لکیریں',
      descriptionArabic: 'علامات الرصيف وخطوط الطريق',
      descriptionHindi: 'फुटपाथ के निशान और सड़क की रेखाएं',
      descriptionBengali: 'পেভমেন্ট চিহ্ন এবং সড়ক রেখা',
      icon: 'remove',
      color: '#9b59b6',
      data: roadMarkingData['road-marking'],
      imagePath: 'signs/guide-signs/'
    }
  ];

  const handleBackPress = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigation.goBack();
    }
  };

  const renderHeaderRight = () => (
    <View style={styles.headerRight}>
      <LanguageSwitcher
        value={selectedLanguage}
        onChange={setSelectedLanguage}
        languages={LANGUAGES}
        compact
        triggerStyle={styles.languageButton}
        triggerTextStyle={{ color: 'white' }}
      />
      <TouchableOpacity
        style={styles.headerButton}
        onPress={selectedCategory ? () => setSelectedCategory(null) : handleBackPress}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  const getSignTitle = (sign) => {
    if (selectedLanguage === 'en') {
      return sign.title_en;
    }
    return sign.secondary_languages?.[selectedLanguage]?.title || sign.title_en;
  };

  const getSignDescription = (sign) => {
    if (selectedLanguage === 'en') {
      return sign.description_en;
    }
    return sign.secondary_languages?.[selectedLanguage]?.description || sign.description_en;
  };

  const getCategoryTitle = (category) => {
    if (selectedLanguage === 'en') {
      return category.title;
    }
    if (selectedLanguage === 'ur') {
      return category.titleUrdu;
    }
    if (selectedLanguage === 'ar') {
      return category.titleArabic || category.titleUrdu;
    }
    if (selectedLanguage === 'hi') {
      return category.titleHindi || category.titleUrdu;
    }
    if (selectedLanguage === 'bn') {
      return category.titleBengali || category.titleUrdu;
    }
    return category.title;
  };

  const getCategoryDescription = (category) => {
    if (selectedLanguage === 'en') {
      return category.description;
    }
    if (selectedLanguage === 'ur') {
      return category.descriptionUrdu;
    }
    if (selectedLanguage === 'ar') {
      return category.descriptionArabic || category.descriptionUrdu;
    }
    if (selectedLanguage === 'hi') {
      return category.descriptionHindi || category.descriptionUrdu;
    }
    if (selectedLanguage === 'bn') {
      return category.descriptionBengali || category.descriptionUrdu;
    }
    return category.description;
  };

  const renderSignImage = (sign) => {
    // Extract filename from image_path
    const imagePath = sign.image_path;
    const imageSource = resolveImageSource(imagePath);
    if (imageSource) {
      return (
        <Image 
          source={imageSource} 
          style={styles.signImage}
          resizeMode="contain"
        />
      );
    }

    // Fallback to placeholder if image not found
    return (
      <View style={styles.placeholderImage}>
        <View style={styles.signTypeIcon}>
          <Ionicons 
            name={
              sign.type === 'regulatory' ? 'checkmark-circle' :
              sign.type === 'warning' ? 'warning' :
              sign.type === 'guide' ? 'information-circle' :
              'remove'
            } 
            size={40} 
            color={
              sign.type === 'regulatory' ? '#e74c3c' :
              sign.type === 'warning' ? '#f39c12' :
              sign.type === 'guide' ? '#3498db' :
              '#9b59b6'
            } 
          />
        </View>
        <Text style={styles.placeholderTitle}>{getSignTitle(sign)}</Text>
        <Text style={styles.placeholderSubtitle}>
          {sign.type.charAt(0).toUpperCase() + sign.type.slice(1)} Sign
        </Text>
      </View>
    );
  };

  const renderCategoryTile = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryTile, { borderLeftColor: item.color }]}
      onPress={() => setSelectedCategory(item)}
    >
      <View style={styles.tileContent}>
        <View style={[styles.tileIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={32} color="white" />
        </View>
        <View style={styles.tileText}>
          <Text style={styles.tileTitle}>{getCategoryTitle(item)}</Text>
          <Text style={styles.tileDescription}>{getCategoryDescription(item)}</Text>
          <Text style={styles.tileCount}>{item.data.length} signs</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#1a5f3a" />
      </View>
    </TouchableOpacity>
  );

  const renderSignItem = ({ item, index }) => (
    <View style={styles.signCard}>
      <View style={styles.signHeader}>
        <Text style={styles.signNumber}>{index + 1} / {selectedCategory.data.length}</Text>
        <Text style={styles.signType}>{item.type.toUpperCase()}</Text>
      </View>
      
      <View style={styles.signImageContainer}>
        {renderSignImage(item)}
      </View>
      
      <View style={styles.signInfo}>
        <Text style={styles.signTitle}>{getSignTitle(item)}</Text>
        <Text style={styles.signDescription}>{getSignDescription(item)}</Text>
      </View>
    </View>
  );

  const renderCategoryView = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a5f3a" />
      <Header 
        customGreeting="Road Signs"
        customSubtitle={
          selectedLanguage === 'en' ? 'Road Signs' :
          selectedLanguage === 'ur' ? 'روڈ سائنز' :
          selectedLanguage === 'ar' ? 'علامات الطريق' :
          selectedLanguage === 'hi' ? 'सड़क संकेत' :
          selectedLanguage === 'bn' ? 'সড়ক চিহ্ন' : 'Road Signs'
        }
      >
        {renderHeaderRight()}
      </Header>
      

      <FlatList
        data={signCategories}
        renderItem={renderCategoryTile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderSignsView = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a5f3a" />
      <Header 
        //customGreeting={}
        customSubtitle={getCategoryTitle(selectedCategory)}
      >
        {renderHeaderRight()}
      </Header>
      
      <View style={styles.signsHeader}>
        <Text style={styles.signsCount}>
          {selectedCategory.data.length} {
            selectedLanguage === 'en' ? 'signs' :
            selectedLanguage === 'ar' ? 'علامات' :
            selectedLanguage === 'ur' ? 'نشانات' :
            selectedLanguage === 'hi' ? 'संकेत' :
            selectedLanguage === 'bn' ? 'চিহ্ন' : 'signs'
          }
        </Text>
      </View>

      <FlatList
        data={selectedCategory.data}
        renderItem={renderSignItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.signsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return selectedCategory ? renderSignsView() : renderCategoryView();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  languageButton: {
    marginRight: 4,
  },
  categoriesList: {
    padding: 20,
  },
  categoryTile: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  tileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tileText: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a5f3a',
    marginBottom: 4,
  },
  tileDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tileCount: {
    fontSize: 12,
    color: '#1a5f3a',
    fontWeight: '500',
  },
  signsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  signsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a5f3a',
  },
  signsList: {
    padding: 20,
  },
  signCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  signNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a5f3a',
  },
  signType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  signImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  signImage: {
    width: 150,
    height: 150,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signTypeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a5f3a',
    textAlign: 'center',
    marginBottom: 4,
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  signInfo: {
    padding: 16,
  },
  signTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a5f3a',
    marginBottom: 8,
  },
  signDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default RoadSignsScreen;