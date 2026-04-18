import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';
import guideQuizData from '../data/quiz/quiz-guide-signs.json';
import regulatoryQuizData from '../data/quiz/quiz-regulatory-signs.json';
import roadMarkingQuizData from '../data/quiz/quiz-road-marking.json';
import warningQuizData from '../data/quiz/quiz-warning-signs.json';
import temporarySignsQuizData from '../data/quiz/quiz-temporary-signs.json';
import theoryQuiz1Data from '../data/quiz/theory-quiz-1.json';
import theoryQuiz2Data from '../data/quiz/theory-quiz-2.json';
import theoryQuiz3Data from '../data/quiz/theory-quiz-3.json';
import theoryQuiz4Data from '../data/quiz/theory-quiz-4.json';

const TestScreen = ({ navigation }) => {
  const { username } = useUser();

  const quizzes = [
    {
      id: '1',
      title: 'Take Mock Test',
      titleArabic: 'اختبار تجريبي',
      icon: 'desktop-outline',
      description: 'Practice with comprehensive mock questions',
      color: '#2c3e50',
      onPress: () => navigation.navigate('MockQuiz')
    },
    {
      id: '2',
      title: 'Regulatory Signs Quiz',
      titleArabic: 'اختبار الإشارات التنظيمية',
      icon: 'chevron-forward-circle-outline',
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
      id: '3',
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
      id: '4',
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
      id: '5',
      title: 'Road Markings Quiz',
      titleArabic: 'اختبار علامات الطريق',
      icon: 'contract-outline',
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
      id: '6',
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
    },
    {
      id: '7',
      title: 'Speed & Distance Quiz',
      titleArabic: 'اختبار السرعة والمسافة',
      icon: 'speedometer-outline',
      description: 'Speed limits and distance regulations',
      color: '#be2edd',
      onPress: () => {
        const quiz = {
          id: 'speed-and-distance-quiz',
          title: 'Speed & Distance Quiz',
          questions: theoryQuiz1Data['speed-and-distance-quiz'].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en.map(opt => opt.text),
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: '8',
      title: 'Fines, Points, & Violations Quiz',
      titleArabic: 'اختبار الغرامات والنقاط والمخالفات',
      icon: 'cash-outline',
      description: 'Traffic fines, points and violations',
      color: '#e056fd',
      onPress: () => {
        const quiz = {
          id: 'fines-points-violations-quiz',
          title: 'Fines, Points, & Violations Quiz',
          questions: theoryQuiz2Data['Fines, Points, & Violations Quiz'].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en.map(opt => opt.text),
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: '9',
      title: 'Fines, Points, & Violations Quiz 2',
      titleArabic: 'اختبار الغرامات والنقاط والمخالفات 2',
      icon: 'cash-outline',
      description: 'More traffic fines, points and violations',
      color: '#D980FA',
      onPress: () => {
        const quiz = {
          id: 'fines-points-violations-quiz-2',
          title: 'Fines, Points, & Violations Quiz 2',
          questions: theoryQuiz3Data['Fines, Points, & Violations Quiz 2 '].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en.map(opt => opt.text),
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: '10',
      title: 'Rules, Safety, & Procedures Quiz',
      titleArabic: 'اختبار القواعد والسلامة والإجراءات',
      icon: 'shield-checkmark-outline',
      description: 'Road rules, safety and procedures',
      color: '#EE5A24',
      onPress: () => {
        const quiz = {
          id: 'rules-safety-procedures-quiz',
          title: 'Rules, Safety, & Procedures Quiz',
          questions: theoryQuiz4Data['Rules, Safety, & Procedures Quiz '].map((item, index) => ({
            id: index + 1,
            question: item.question_en,
            options: item.options_en.map(opt => opt.text),
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    }
  ];

  const renderHeaderRight = () => null;

  const ListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Test Center</Text>
      <Text style={styles.description}>
        Choose a quiz to test your knowledge
      </Text>
    </View>
  );

  const renderQuizItem = ({ item }) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={item.onPress}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          {typeof item.icon === 'string' ? (
            <Ionicons name={item.icon} size={32} color="white" />
          ) : (
            <Image 
              source={item.icon} 
              style={styles.iconImage} 
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.quizTitle}>{item.title}</Text>
          <Text style={styles.quizTitleArabic}>{item.titleArabic}</Text>
          <Text style={styles.quizDescription}>{item.description}</Text>
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
        pageTitle="Test Center"
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
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
  quizCard: {
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
  iconImage: {
    width: 32,
    height: 32,
    tintColor: 'white',
  },
  textContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quizTitleUrdu: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  quizDescription: {
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

export default TestScreen;
