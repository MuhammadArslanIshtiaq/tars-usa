import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';
import guideQuizData from '../data/quiz/quiz-guide-signs.json';
import regulatoryQuizData from '../data/quiz/quiz-regulatory-signs.json';
import roadMarkingQuizData from '../data/quiz/quiz-road-marking.json';
import warningQuizData from '../data/quiz/quiz-warning-signs.json';
import temporarySignsQuizData from '../data/quiz/quiz-temporary-signs.json';

const SignTestsScreen = ({ navigation, route }) => {
  const { username } = useUser();
  const { authority } = route.params;

  const signCategories = [
    {
      id: 'regulatory',
      title: 'Regulatory Signs Quiz',
      titleArabic: 'اختبار الإشارات التنظيمية',
      icon: 'warning-outline',
      description: 'Test your knowledge of regulatory signs',
      color: '#e74c3c',
      onPress: () => {
        const quiz = {
          id: 'regulatory-signs-quiz',
          title: 'Regulatory Signs Quiz',
          questions: regulatoryQuizData['regulatory-quiz'].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: item.image_path,
            secondary_languages: item.secondary_languages
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: 'warning',
      title: 'Warning Signs Quiz',
      titleArabic: 'اختبار الإشارات التحذيرية',
      icon: 'warning-outline',
      description: 'Test your knowledge of warning signs',
      color: '#f39c12',
      onPress: () => {
        const quiz = {
          id: 'warning-signs-quiz',
          title: 'Warning Signs Quiz',
          questions: warningQuizData['warning-quiz'].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: item.image_path,
            secondary_languages: item.secondary_languages
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: 'guide',
      title: 'Guide Signs Quiz',
      titleArabic: 'اختبار إشارات التوجيه',
      icon: 'information-circle-outline',
      description: 'Test your knowledge of guide signs',
      color: '#3498db',
      onPress: () => {
        const quiz = {
          id: 'guide-signs-quiz',
          title: 'Guide Signs Quiz',
          questions: guideQuizData['guide-signs-quiz'].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: item.image_path,
            secondary_languages: item.secondary_languages
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: 'road-marking',
      title: 'Road Markings Quiz',
      titleArabic: 'اختبار علامات الطريق',
      icon: 'warning-outline',
      description: 'Test your knowledge of road markings',
      color: '#27ae60',
      onPress: () => {
        const quiz = {
          id: 'road-marking-quiz',
          title: 'Road Markings Quiz',
          questions: roadMarkingQuizData['road-marking-quiz'].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: item.image_path,
            secondary_languages: item.secondary_languages
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: 'temporary-work',
      title: 'Temporary Work Signs Quiz',
      titleArabic: 'اختبار إشارات الأعمال المؤقتة',
      icon: 'construct-outline',
      description: 'Test your knowledge of temporary work signs',
      color: '#ff6b6b',
      onPress: () => {
        const quiz = {
          id: 'temporary-work-quiz',
          title: 'Temporary Work Signs Quiz',
          questions: temporarySignsQuizData['temporary-work-quiz'].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: item.image_path,
            secondary_languages: item.secondary_languages
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    }
  ];

  const renderHeaderRight = () => (
    <TouchableOpacity 
      style={styles.headerButton}
      onPress={() => navigation.navigate('Main')}
    >
      <Ionicons name="arrow-back" size={28} color="white" />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.welcomeText}>Welcome, {username || 'Guest'}!</Text>
      <Text style={styles.sectionTitle}>Sign Tests</Text>
      <Text style={styles.sectionSubtitle}>{authority?.name}</Text>
      <Text style={styles.description}>
        Choose a category to practice traffic sign recognition
      </Text>
    </View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={item.onPress}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={32} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categoryTitleArabic}>{item.titleArabic}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color="#1a5f3a" />
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
        pageTitle="Sign Tests"
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={signCategories}
        renderItem={renderCategoryItem}
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
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
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
  arrowContainer: {
    marginLeft: 8,
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

export default SignTestsScreen;
