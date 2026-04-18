import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';
import theoryQuiz1Data from '../data/quiz/theory-quiz-1.json';
import theoryQuiz2Data from '../data/quiz/theory-quiz-2.json';
import theoryQuiz3Data from '../data/quiz/theory-quiz-3.json';
import theoryQuiz4Data from '../data/quiz/theory-quiz-4.json';

const RulesScreen = ({ navigation }) => {
  const { username } = useUser();

  const rulesQuizzes = [
    {
      id: '1',
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
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: '2',
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
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: '3',
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
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
          }))
        };
        navigation.navigate('Quiz', { quiz });
      }
    },
    {
      id: '4',
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
            options: item.options_en,
            correctAnswer: item.options_en.find(opt => opt.is_correct).text,
            image: null,
            secondary_languages: item.secondary_languages || {}
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
      <Text style={styles.sectionTitle}>Rules Tests</Text>
      <Text style={styles.description}>
        Choose a quiz to practice traffic rules and regulations
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
          <Ionicons name={item.icon} size={32} color="white" />
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
        pageTitle="Rules Tests"
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={rulesQuizzes}
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
  textContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quizTitleArabic: {
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

export default RulesScreen;
