import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useUser } from '../contexts/UserContext';
import mockQuizData from '../data/quiz/mock-quiz-01.json';
import { useAdTriggerFallback } from '../contexts/AdTriggerFallbackContext';
import { useAdMob } from '../hooks/useAdMob';
import { COLORS } from '../theme/colors';
import { resolveImageSource } from '../utils/resolveImageSource';

const MockQuizScreen = ({ navigation, route }) => {
  const { username, saveQuizResult } = useUser();
  const { showAdAndWaitForClose } = useAdMob();
  const { presentAdTrigger } = useAdTriggerFallback();
  const { title = 'Mock Quiz' } = route.params || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [startTime] = useState(Date.now());
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    fetchMockQuizData();
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchMockQuizData = () => {
    try {
      setLoading(true);
      // Get questions from mock-quiz-01.json
      const quizQuestions = mockQuizData['mockquiz-01'] || [];
      
      if (quizQuestions && quizQuestions.length > 0) {
        // Shuffle questions array
        const shuffledQuestions = shuffleArray(quizQuestions);
        
        // Process questions to match expected format
        const processedQuestions = shuffledQuestions.map((item, index) => {
          // Attach secondary language translations to each option before shuffling
          const optionsWithTranslations = (item.options_en || []).map((option, idx) => {
            return {
              ...option,
              translations: {
                ur: item.secondary_languages?.ur?.options?.[idx]?.text || option.text,
                ar: item.secondary_languages?.ar?.options?.[idx]?.text || option.text,
                hi: item.secondary_languages?.hi?.options?.[idx]?.text || option.text,
                bn: item.secondary_languages?.bn?.options?.[idx]?.text || option.text
              }
            };
          });
          
          // Shuffle options after attaching translations
          const shuffledOptions = shuffleArray(optionsWithTranslations);
          
          return {
            id: index + 1,
            question: item.question_en,
            question_urdu: item.secondary_languages?.ur?.question || '',
            question_ar: item.secondary_languages?.ar?.question || '',
            question_hi: item.secondary_languages?.hi?.question || '',
            question_bn: item.secondary_languages?.bn?.question || '',
            options: shuffledOptions,
            options_en_original: item.options_en, // Store original options for language mapping
            correctAnswer: shuffledOptions.find(opt => opt.is_correct)?.text,
            rationale: item.rationale_en,
            rationale_urdu: item.secondary_languages?.ur?.rationale || '',
            rationale_ar: item.secondary_languages?.ar?.rationale || '',
            rationale_hi: item.secondary_languages?.hi?.rationale || '',
            rationale_bn: item.secondary_languages?.bn?.rationale || '',
            image_path: item.image_path,
            secondary_languages: item.secondary_languages
          };
        });
        
        setQuestions(processedQuestions);
      } else {
        console.error('❌ No questions found in mock quiz data');
        setError('No questions available for this mock test. Please try again later.');
      }
    } catch (error) {
      console.error('Error loading mock quiz data:', error);
      setError('Failed to load mock test. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedAnswerId(null);
    setScore(0);
    setShowResult(false);
    setIncorrectAnswers([]);
    setShowReviewModal(false);
    fetchMockQuizData(); // Re-fetch for a new set of questions
  };

  const currentQuestion = questions[currentQuestionIndex] || {};
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Get question text based on selected language
  const getQuestionText = (question) => {
    if (selectedLanguage === 'en') {
      return question.question;
    }
    if (selectedLanguage === 'ur') {
      return question.question_urdu || question.question;
    }
    if (selectedLanguage === 'ar') {
      return question.question_ar || question.question;
    }
    if (selectedLanguage === 'hi') {
      return question.question_hi || question.question;
    }
    if (selectedLanguage === 'bn') {
      return question.question_bn || question.question;
    }
    return question.question;
  };

  // Get option text based on selected language
  const getOptionText = (option, question, optionIndex) => {
    if (selectedLanguage === 'en') {
      return option.text;
    }
    
    // Check if option has translations attached (from processing step)
    if (option.translations && option.translations[selectedLanguage]) {
      return option.translations[selectedLanguage];
    }
    
    // Fallback: Check secondary languages
    // We need to find the original index of this option in options_en
    if (question.secondary_languages?.[selectedLanguage]?.options && question.options_en_original) {
      const englishText = option.text;
      
      // Find the original index by matching English text in the original options
      const originalIndex = question.options_en_original.findIndex(opt => opt.text === englishText);
      
      if (originalIndex >= 0 && question.secondary_languages[selectedLanguage].options[originalIndex]) {
        return question.secondary_languages[selectedLanguage].options[originalIndex].text;
      }
    }
    
    return option.text;
  };

  // Helper to extract comparable text from option objects or strings (legacy function)
  const getOptionTextLegacy = (option) => {
    return option?.text || option?.option_text || option?.choice || option?.answer || option?.answer_text || (typeof option === 'string' ? option : '');
  };

  const getOptionTextUrdu = (option) => {
    return option?.text_urdu || option?.option_urdu || option?.choice_urdu || option?.answer_urdu || option?.answer_text_urdu || '';
  };

  const areOptionsEqual = (a, b) => {
    return getOptionTextLegacy(a) === getOptionTextLegacy(b);
  };

  const getOptionId = (option, fallbackIndex) => {
    if (option && typeof option === 'object') {
      // For mock quiz options with is_correct property, use text as ID
      if (option.hasOwnProperty('is_correct')) {
        return option.text;
      }
      // For other quiz types, use existing logic
      return option.id || option.answer_id || option.option_letter?.toLowerCase() || (typeof fallbackIndex === 'number' ? String.fromCharCode(97 + fallbackIndex) : null);
    }
    if (typeof option === 'string') return option;
    return typeof fallbackIndex === 'number' ? String.fromCharCode(97 + fallbackIndex) : null;
  };

  const getCorrectAnswerId = (q) => {
    // For mock quiz, find the correct option by checking is_correct property
    if (q?.options && Array.isArray(q.options)) {
      const correctOption = q.options.find(opt => opt.is_correct === true);
      if (correctOption) {
        return correctOption.text; // Return the text as the ID for comparison
      }
    }
    // Fallback to other possible properties
    return q?.correct_answer || q?.correctAnswer || q?.correct_option || q?.correct_option_id || q?.answer || q?.right_answer || null;
  };

  const handleAnswer = (answer, answerIndex) => {
    if (selectedAnswerId !== null) return; // Prevent changing answer
    const answerId = getOptionId(answer, answerIndex);
    setSelectedAnswer(answer);
    setSelectedAnswerId(answerId);

    const correctId = getCorrectAnswerId(currentQuestion);
    
    if (answerId && correctId && String(answerId) === String(correctId)) {
      setScore(score + 1);
    } else {
      const userAnswerText = getOptionTextLegacy(answer);
      const correctOption = (currentQuestion.options || []).find(opt => getOptionId(opt) === String(correctId));
      const correctAnswerText = getOptionTextLegacy(correctOption) || getOptionTextLegacy(currentQuestion.correctAnswer);

      setIncorrectAnswers(prev => [...prev, {
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        questionText: currentQuestion.question || currentQuestion.question_text || currentQuestion.title || currentQuestion.text,
        questionUrdu: currentQuestion.question_urdu || currentQuestion.question_urdu_text || currentQuestion.title_urdu || currentQuestion.text_urdu,
        selectedAnswerId: answerId,
        selectedAnswer: userAnswerText,
        correctAnswerId: String(correctId),
        correctAnswer: correctAnswerText,
        imagePath: currentQuestion.image_path
      }]);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswerId === null) {
      Alert.alert('Select an Answer', 'Please select an answer before proceeding.');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setSelectedAnswerId(null);
    } else {
      setShowResult(true);
    }
  };

  const handleFinishQuiz = async () => {
    // Ask for confirmation if not at the last question
    if (currentQuestionIndex < questions.length - 1) {
      setShowFinishConfirmation(true);
    } else {
      finishQuizNow();
    }
  };

  const finishQuizNow = async () => {
    // Save quiz result to local storage
    try {
      const percentage = Math.round((score / questions.length) * 100);
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      await saveQuizResult({
        quizId: `mock-quiz-01`,
        title: title,
        score: percentage,
        totalQuestions: questions.length,
        correctAnswers: score,
        timeSpent: timeSpent
      });
    } catch (error) {
      console.error('Error saving mock quiz result:', error);
    }
    
    // Show interstitial ad when quiz is completed
    (async () => {
      try {
        await presentAdTrigger(showAdAndWaitForClose, { timeoutMs: 8000 });
      } catch {
        // ignore
      } finally {
        setShowResult(true);
      }
    })();
  };

  const handleRetryQuiz = () => {
    resetQuiz();
  };

  const handleGoToQuizzes = () => {
    navigation.navigate('Home');
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtons}>
      <LanguageSwitcher
        value={selectedLanguage}
        onChange={setSelectedLanguage}
        compact
        triggerStyle={styles.languageButton}
        triggerTextStyle={{ color: 'white' }}
      />
      <TouchableOpacity
        style={[styles.headerButton, { marginLeft: 8 }]}
        onPress={() => {
          if (!showResult && currentQuestionIndex > 0) {
            Alert.alert(
              'Leave Quiz?',
              'Are you sure you want to leave? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'End Quiz',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await presentAdTrigger(showAdAndWaitForClose, { timeoutMs: 8000 });
                    } catch {
                      // ignore
                    } finally {
                      navigation.navigate('Main', { screen: 'Home' });
                    }
                  },
                }
              ]
            );
          } else {
            navigation.navigate('Main', { screen: 'Home' });
          }
        }}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  const getPercentageColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return '#28a745';
    if (percentage >= 80) return '#17a2b8';
    if (percentage >= 70) return '#ffc107';
    if (percentage >= 60) return '#fd7e14';
    return '#dc3545';
  };

  // Image rendering function for mock quiz
  const renderImage = (imagePath) => {
    if (!imagePath) return null;

    const imageSource = resolveImageSource(imagePath);

    if (imageSource) {
      return (
        <Image
          source={imageSource}
          style={styles.questionImage}
          resizeMode="contain"
        />
      );
    }

    return null;
  };

  const renderReviewModal = () => (
    <Modal
      visible={showReviewModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowReviewModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.reviewModalContent}>
          <View style={styles.reviewModalHeader}>
            <Text style={styles.reviewModalTitle}>Incorrect Answers Review</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReviewModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.reviewModalBody} showsVerticalScrollIndicator={false}>
            {incorrectAnswers.map((item, index) => {
              const question = item.question;
              const questionUrdu = item.questionUrdu || '';
              const userAnswer = item.userAnswer;
              const correctAnswer = item.correctAnswer;
              
              // Get the original question to access all options
              const originalQuestion = questions[item.questionIndex] || questions.find(q => 
                (q.question || q.question_text || q.title || q.text) === (item.questionText || question) ||
                (q.question_urdu || q.question_urdu_text || q.title_urdu || q.text_urdu) === item.questionUrdu
              );
              
              return (
                <View key={index} style={styles.reviewQuestionCard}>
                  <View style={styles.reviewQuestionHeader}>
                    <Text style={styles.reviewQuestionNumber}>Question {item.questionIndex + 1}</Text>
                    <View style={styles.reviewQuestionStatus}>
                      <Ionicons name="close-circle" size={16} color="#dc3545" />
                      <Text style={styles.reviewQuestionStatusText}>Incorrect</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.reviewQuestionText}>{question.question || question.question_text || question.title || question.text}</Text>
                  {questionUrdu && (
                    <Text style={styles.reviewQuestionTextUrdu}>{questionUrdu}</Text>
                  )}
                  
                  {question.image_path && (
                    <View style={styles.reviewImageContainer}>
                      {renderImage(question.image_path)}
                    </View>
                  )}
                  
                  <View style={styles.reviewOptionsContainer}>
                    {originalQuestion?.options?.map((option, optionIndex) => {
                      const optionId = getOptionId(option, optionIndex);
                      const isCorrect = String(optionId) === String(item.correctAnswerId) || getOptionTextLegacy(option) === item.correctAnswer;
                      const isUserChoice = String(optionId) === String(item.selectedAnswerId) || getOptionTextLegacy(option) === item.selectedAnswer;
                      const optionText = getOptionTextLegacy(option) || `Option ${String.fromCharCode(65 + optionIndex)}`;
                      const optionTextUrdu = getOptionTextUrdu(option);
                      return (
                        <View
                          key={optionIndex}
                          style={[
                            styles.reviewOptionItem,
                            isCorrect && styles.reviewCorrectOption,
                            isUserChoice && !isCorrect && styles.reviewIncorrectOption,
                          ]}
                        >
                          <View style={styles.reviewOptionContent}>
                            <Text style={[
                              styles.reviewOptionText,
                              isCorrect && styles.reviewCorrectOptionText,
                              isUserChoice && !isCorrect && styles.reviewIncorrectOptionText,
                            ]}>
                              {optionText}
                            </Text>
                            {optionTextUrdu && (
                              <Text style={styles.reviewOptionTextUrdu}>{optionTextUrdu}</Text>
                            )}
                          </View>
                          {isCorrect && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
                          {isUserChoice && !isCorrect && <Ionicons name="close-circle" size={20} color="#dc3545" />}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
            
            {incorrectAnswers.length === 0 && (
              <View style={styles.emptyReviewContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#28a745" />
                <Text style={styles.emptyReviewText}>Perfect Score!</Text>
                <Text style={styles.emptyReviewSubText}>You answered all questions correctly.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderFinishConfirmation = () => (
    <Modal
      visible={showFinishConfirmation}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFinishConfirmation(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="warning-outline" size={60} color="#dc3545" />
          <Text style={styles.modalTitle}>Finish Mock Test Early?</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to finish the mock test now? You're on question {currentQuestionIndex + 1} of {questions.length}.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowFinishConfirmation(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => {
                setShowFinishConfirmation(false);
                finishQuizNow();
              }}
            >
              <Text style={styles.confirmButtonText}>Finish Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header
          username={username}
          navigation={navigation}
          pageTitle={title}
          titleOnly
        >
          {renderHeaderRight()}
        </Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a5f3a" />
          <Text style={styles.loadingText}>Loading mock test questions...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header
          username={username}
          navigation={navigation}
          pageTitle={title}
          titleOnly
        >
          {renderHeaderRight()}
        </Header>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMockQuizData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header
          username={username}
          navigation={navigation}
          pageTitle={title}
          titleOnly
        >
          {renderHeaderRight()}
        </Header>
        <View style={styles.emptyContainer}>
          <Ionicons name="help-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No questions available for this mock test.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMockQuizData}>
            <Text style={styles.retryButtonText}>Reload Questions</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;
    const resultColor = getPercentageColor(score, questions.length);
    const incorrect = questions.length - score;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header
          username={username}
          navigation={navigation}
          pageTitle={title}
          titleOnly
        >
          {renderHeaderRight()}
        </Header>
        <ScrollView contentContainerStyle={styles.resultScrollContent}>
          <View style={styles.resultContainer}>
            {/* Success/Failure Icon */}
            <View style={styles.resultIconContainer}>
              <Ionicons
                name={passed ? 'checkmark-circle' : 'close-circle'}
                size={80}
                color={passed ? '#28a745' : '#dc3545'}
              />
            </View>
            
            {/* Title */}
            <Text style={styles.resultTitle}>
              {passed ? 'Congratulations!' : 'Better Luck Next Time!'}
            </Text>
            
            {/* Large Percentage Score */}
            <Text style={[styles.resultPercentage, { color: resultColor }]}>
              {percentage}%
            </Text>
            
            {/* Description */}
            <Text style={styles.resultMessage}>
              {passed ? 'You passed the mock test!' : 'You did not pass the mock test. Keep practicing!'}
            </Text>
            
            {/* Statistics Tiles */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle" size={32} color="#28a745" />
                </View>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={[styles.statValue, { color: '#28a745' }]}>{score}</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="close-circle" size={32} color="#dc3545" />
                </View>
                <Text style={styles.statLabel}>Incorrect</Text>
                <Text style={[styles.statValue, { color: '#dc3545' }]}>{incorrect}</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="logo-electron" size={32} color="#17a2b8" />
                </View>
                <Text style={styles.statLabel}>Accuracy</Text>
                <Text style={[styles.statValue, { color: resultColor }]}>{percentage}%</Text>
              </View>
            </View>

            {/* Review Incorrect Answers Button */}
            {incorrectAnswers.length > 0 && (
              <TouchableOpacity 
                style={styles.reviewIncorrectButton} 
                onPress={() => setShowReviewModal(true)}
              >
                <Ionicons name="eye-outline" size={20} color="white" />
                <Text style={styles.reviewIncorrectButtonText}>Review Incorrect Answers</Text>
              </TouchableOpacity>
            )}

            {/* Action Buttons */}
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.tryAgainButton} onPress={handleRetryQuiz}>
                <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {renderReviewModal()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        username={username}
        navigation={navigation}
        pageTitle={title}
          titleOnly
      >
        {renderHeaderRight()}
      </Header>

      <ScrollView style={styles.quizContentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.quizContent}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentQuestionIndex + 1}/{questions.length}
              </Text>
              <TouchableOpacity
                style={styles.endQuizButton}
                onPress={handleFinishQuiz}
              >
                <Ionicons name="close" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>
              {getQuestionText(currentQuestion)}
            </Text>
            {currentQuestion.image_path && (
              <View style={styles.imageContainer}>
                {renderImage(currentQuestion.image_path)}
              </View>
            )}
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const optionText = getOptionText(option, currentQuestion, index);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    selectedAnswerId !== null && String(getOptionId(option, index)) === String(getCorrectAnswerId(currentQuestion)) && styles.correctAnswer,
                    selectedAnswerId !== null && String(getOptionId(option, index)) !== String(getCorrectAnswerId(currentQuestion)) && String(selectedAnswerId) === String(getOptionId(option, index)) && styles.wrongAnswer,
                  ]}
                  onPress={() => handleAnswer(option, index)}
                  disabled={selectedAnswerId !== null}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionText}>{optionText}</Text>
                  </View>
                  {selectedAnswerId !== null && (
                    String(getOptionId(option, index)) === String(getCorrectAnswerId(currentQuestion)) ? (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    ) : (
                      String(selectedAnswerId) === String(getOptionId(option, index)) && <Ionicons name="close-circle" size={24} color="#F44336" />
                    )
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.nextButton,
          selectedAnswerId === null && styles.nextButtonDisabled,
        ]}
        onPress={handleNextQuestion}
        disabled={selectedAnswerId === null}
      >
        <Text style={styles.nextButtonText}>
          {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </Text>
      </TouchableOpacity>
      
      {/* Render the finish confirmation modal */}
      {renderFinishConfirmation()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1a5f3a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageButton: {
    marginRight: 8,
  },
  finishQuizButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishQuizButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quizContentScroll: {
    flex: 1,
  },
  quizContent: {
    padding: 16,
    paddingBottom: 32,
  },
  progressBarContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 8,
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a5f3a',
    borderRadius: 5,
  },
  progressText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  endQuizButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  questionImage: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  questionTextUrdu: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    lineHeight: 24,
    marginTop: 8,
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextUrdu: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  optionTextContainer: {
    flex: 1,
  },
  correctAnswer: {
    borderColor: '#28a745',
    backgroundColor: '#e6ffe6',
  },
  wrongAnswer: {
    borderColor: '#dc3545',
    backgroundColor: '#ffe6e6',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  nextButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    elevation: 5,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: 500,
  },
  resultIconContainer: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultPercentage: {
    fontSize: 52,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minHeight: 80,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reviewIncorrectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewIncorrectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultActions: {
    width: '100%',
    alignItems: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#1a5f3a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tryAgainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#dc3545',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reviewModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reviewModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  reviewModalBody: {
    padding: 20,
  },
  reviewQuestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  reviewQuestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewQuestionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewQuestionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewQuestionStatusText: {
    fontSize: 14,
    color: '#dc3545',
    marginLeft: 4,
    fontWeight: '600',
  },
  reviewQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  reviewQuestionTextUrdu: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
    writingDirection: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
  },
  reviewImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  reviewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  reviewOptionsContainer: {
    marginTop: 8,
  },
  reviewOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  reviewCorrectOption: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
  },
  reviewIncorrectOption: {
    borderColor: '#dc3545',
    backgroundColor: '#fff8f8',
  },
  reviewOptionContent: {
    flex: 1,
  },
  reviewOptionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  reviewOptionTextUrdu: {
    fontSize: 12,
    color: '#666',
    writingDirection: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
  },
  reviewCorrectOptionText: {
    color: '#28a745',
    fontWeight: '600',
  },
  reviewIncorrectOptionText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  emptyReviewContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyReviewText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyReviewSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MockQuizScreen;
