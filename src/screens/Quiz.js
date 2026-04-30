import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import LanguageSwitcher, { LANGUAGES as ALL_LANGUAGES } from '../components/LanguageSwitcher';
import { useUser } from '../contexts/UserContext';
import { useAdMob } from '../hooks/useAdMob';
import { resolveImageSource } from '../utils/resolveImageSource';
import { loadMobileQuizAsync } from '../utils/usQuizLoaderAsync';
import { getDownloadedLanguageCodes, isBundledLanguage } from '../utils/languagePacks';
import { COLORS } from '../theme/colors';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to prepare randomized questions with randomized options
const prepareRandomizedQuestions = (questions) => {
  return shuffleArray(questions).map(question => {
    // Attach secondary language translations to each option before shuffling
    const optionsWithTranslations = (question.options || []).map((option, index) => {
      // If option is already an object, enhance it with secondary language data
      if (typeof option === 'object') {
        return {
          ...option,
          translations: {
            ur: question.secondary_languages?.ur?.options?.[index]?.text || option.text,
            ar: question.secondary_languages?.ar?.options?.[index]?.text || option.text,
            hi: question.secondary_languages?.hi?.options?.[index]?.text || option.text,
            bn: question.secondary_languages?.bn?.options?.[index]?.text || option.text
          }
        };
      }
      // If option is a string, create an object with translations
      return {
        text: option,
        translations: {
          ur: question.secondary_languages?.ur?.options?.[index]?.text || option,
          ar: question.secondary_languages?.ar?.options?.[index]?.text || option,
          hi: question.secondary_languages?.hi?.options?.[index]?.text || option,
          bn: question.secondary_languages?.bn?.options?.[index]?.text || option
        }
      };
    });
    
    return {
      ...question,
      options: shuffleArray(optionsWithTranslations)
    };
  });
};

const Quiz = ({ route, navigation }) => {
  const { quiz } = route.params;
  const { username, preferences, updatePreferences, saveQuizResult } = useUser();
  const { showAd } = useAdMob();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [startTime] = useState(Date.now());
  const [userAnswers, setUserAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(preferences?.language || 'en');
  const [availableLanguages, setAvailableLanguages] = useState(
    ALL_LANGUAGES.filter((l) => isBundledLanguage(l.code))
  );

  const resetQuiz = (nextQuestions) => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedAnswerId(null);
    setScore(0);
    setShowResult(false);
    setShowReview(false);
    setUserAnswers([]);
    setIncorrectAnswers([]);
    setRandomizedQuestions(prepareRandomizedQuestions(nextQuestions));
  };

  // Helper functions for option handling
  const getOptionId = (option, index) => {
    // If option is a string, use index-based ID
    if (typeof option === 'string') {
      return String.fromCharCode(65 + index);
    }
    // If option is an object, use its ID or generate one
    return option.id || option.option_id || String.fromCharCode(65 + index);
  };

  const getOptionText = (option) => {
    // If option is a string, return it directly
    if (typeof option === 'string') {
      return option;
    }
    // If option is an object, extract text
    return option.text || option.option_text || option.choice || option.answer || '';
  };

  const getOptionTextUrdu = (option) => {
    // If option is a string, no Urdu text available
    if (typeof option === 'string') {
      return '';
    }
    // If option is an object, extract Urdu text
    return option.text_urdu || option.option_text_urdu || option.choice_urdu || '';
  };

  const getCorrectAnswerId = (question) => {
    // Check if options have is_correct property (new structure)
    if (question.options && Array.isArray(question.options)) {
      const correctIndex = question.options.findIndex(opt => opt.is_correct === true);
      if (correctIndex >= 0) {
        return String.fromCharCode(65 + correctIndex);
      }
    }
    
    // For the current quiz structure, correctAnswer is a string
    if (typeof question.correctAnswer === 'string') {
      // Find the index of the correct answer in the options array
      const correctIndex = question.options.findIndex(opt => opt === question.correctAnswer);
      return correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : null;
    }
    
    // Fallback for object-based structure
    return question.correct_answer_id || question.correct_option_id || 
           question.answer || question.right_answer || null;
  };

  useEffect(() => {
    resetQuiz(quiz.questions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.questions]);

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
    } catch (e) {
      // ignore
    }

    const meta = quiz?.meta;
    if (!meta?.slug) return;

    const nextQuiz = await loadMobileQuizAsync({
      category: meta.category,
      state: meta.state,
      slug: meta.slug,
      language: nextLanguage,
    });

    if (!nextQuiz) return;
    resetQuiz(nextQuiz.questions);
  };


  const currentQuestion = randomizedQuestions[currentQuestionIndex] || {};
  const progress = ((currentQuestionIndex + 1) / randomizedQuestions.length) * 100;

  const renderSignImage = (question) => {
    // Handle both question.image and question.imageUrl (for review modal)
    const imagePath = question.image || question.imageUrl;
    
    if (!imagePath) return null;
    
    const imageSource = resolveImageSource(imagePath);
    
    if (imageSource) {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={imageSource} 
            style={styles.signImage}
            resizeMode="contain"
          />
        </View>
      );
    }
    
    return null;
  };

  // Answer handling
  const handleAnswer = (answer, answerIndex) => {
    if (selectedAnswerId !== null) return; // Prevent changing answer
    
    const answerId = getOptionId(answer, answerIndex);
    setSelectedAnswer(answer);
    setSelectedAnswerId(answerId);

    const correctId = getCorrectAnswerId(currentQuestion);
    const isCorrect = answerId && correctId && String(answerId) === String(correctId);
    
    
    if (isCorrect) {
      setScore(score + 1);
    } else {
      // Track incorrect answer for review
      const userAnswerText = getOptionText(answer);
      const correctOption = (currentQuestion.options || []).find(opt => 
        getOptionId(opt) === String(correctId)
      );
      const correctAnswerText = correctOption ? getOptionText(correctOption) : currentQuestion.correctAnswer || 'Unknown';


      setIncorrectAnswers(prev => [...prev, {
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        questionText: currentQuestion.question || currentQuestion.question_text,
        questionUrdu: currentQuestion.question_urdu,
        selectedAnswerId: answerId,
        selectedAnswer: userAnswerText,
        correctAnswerId: String(correctId),
        correctAnswer: correctAnswerText,
        imageUrl: currentQuestion.image_path || currentQuestion.image
      }]);
    }
    
    // Track user's answer for review
    const newUserAnswers = [...userAnswers];
    // Ensure the array is long enough
    while (newUserAnswers.length <= currentQuestionIndex) {
      newUserAnswers.push(null);
    }
    newUserAnswers[currentQuestionIndex] = {
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      image: currentQuestion.image,
      isCorrect: answer === currentQuestion.correctAnswer
    };
    setUserAnswers(newUserAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < randomizedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setSelectedAnswerId(null);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // Convert to seconds
      const percentage = Math.round((score / randomizedQuestions.length) * 100);
      
      // Save quiz result
      saveQuizResult({
        quizId: quiz.id,
        title: quiz.title,
        score: percentage,
        totalQuestions: randomizedQuestions.length,
        correctAnswers: score,
        timeSpent: timeSpent
      });
      
      // Show interstitial ad when quiz is completed
      try {
        showAd();
      } catch (error) {
        console.log('Ad not available or failed to show');
      }
      
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setShowReview(false);
    setUserAnswers([]);
    // Re-randomize questions for the new attempt
    setRandomizedQuestions(prepareRandomizedQuestions(quiz.questions));
  };

  const handleEndQuiz = () => {
    Alert.alert(
      'End Quiz',
      'Are you sure you want to end this quiz? Your progress will be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Quiz',
          style: 'destructive',
          onPress: async () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            const percentage = Math.round((score / randomizedQuestions.length) * 100);
            
            // Save quiz result
            saveQuizResult({
              quizId: quiz.id,
              title: quiz.title,
              score: percentage,
              totalQuestions: randomizedQuestions.length,
              correctAnswers: score,
              timeSpent: timeSpent
            });
            
            // Show interstitial ad when quiz is ended early
            try {
              await showAd();
            } catch (error) {
              console.log('Ad not available or failed to show');
            }
            
            setShowResult(true);
          },
        },
      ]
    );
  };

  const getIncorrectAnswers = () => {
    return userAnswers.filter(answer => answer && !answer.isCorrect);
  };

  const handleReviewMistakes = () => {
    setShowResult(false); // Close result modal first
    setTimeout(() => {
      setShowReview(true);
    }, 100);
  };

  const handleCloseReview = () => {
    setShowReview(false);
    // Always return to Home (new flow) after reviewing mistakes.
    // This avoids old KSA navigation destinations like SignTests/Rules.
    try {
      navigation.navigate('Main', { screen: 'Home' });
    } catch (e) {
      try {
        navigation.popToTop();
      } catch (err) {
        navigation.goBack();
      }
    }
  };


  const getLanguageText = (question, language) => {
    if (language === 'ur' && question.secondary_languages?.ur?.question) {
      return question.secondary_languages.ur.question;
    }
    if (language === 'ar' && question.secondary_languages?.ar?.question) {
      return question.secondary_languages.ar.question;
    }
    if (language === 'hi' && question.secondary_languages?.hi?.question) {
      return question.secondary_languages.hi.question;
    }
    if (language === 'bn' && question.secondary_languages?.bn?.question) {
      return question.secondary_languages.bn.question;
    }
    // Fallback to English
    return question.question_en || question.question || question.question_text;
  };

  const getExplanationLanguageText = (question, language) => {
    const base =
      typeof question?.explanation === 'string' ? question.explanation.trim() : '';
    const baseEn =
      typeof question?.explanation_en === 'string' ? question.explanation_en.trim() : '';

    if (!language || language === 'en') {
      return base || baseEn;
    }

    const localized = question?.secondary_languages?.[language]?.explanation;
    if (typeof localized === 'string' && localized.trim()) {
      return localized.trim();
    }

    return base || baseEn;
  };

  const getOptionLanguageText = (option, language, question, optionIndex) => {
    // Handle string options (from Quiz.js format)
    if (typeof option === 'string') {
      return option;
    }
    
    // For English, return the option text directly
    if (language === 'en') {
      return option.text || option.option_text || option.choice || option.answer || '';
    }
    
    // Check if option has translations attached (from prepareRandomizedQuestions)
    if (option.translations && option.translations[language]) {
      return option.translations[language];
    }
    
    // Fallback: Handle secondary language options from question.secondary_languages
    // We need to find the original index of this option in options_en
    if (question.secondary_languages?.[language]?.options) {
      const englishText = option.text || option.option_text || '';
      
      // Find the original index by matching English text in options_en
      const originalOptions = question.options_en || question.options;
      if (originalOptions && englishText) {
        const originalIndex = originalOptions.findIndex(opt => {
          const optText = typeof opt === 'object' ? opt.text : opt;
          return optText === englishText;
        });
        
        // Use the original index to get the secondary language text
        if (originalIndex >= 0 && question.secondary_languages[language].options[originalIndex]) {
          return question.secondary_languages[language].options[originalIndex].text;
        }
      }
    }
    
    // Handle object options with direct language support (fallback)
    if (language === 'ur' && option.text_ur) {
      return option.text_ur;
    }
    if (language === 'ar' && option.text_ar) {
      return option.text_ar;
    }
    if (language === 'hi' && option.text_hi) {
      return option.text_hi;
    }
    if (language === 'bn' && option.text_bn) {
      return option.text_bn;
    }
    
    // Fallback to English
    return option.text || option.option_text || option.choice || option.answer || '';
  };

  const getAnswerStyle = (option, index) => {
    if (!selectedAnswerId) return styles.option;
    const optionId = getOptionId(option, index);
    const correctId = getCorrectAnswerId(currentQuestion);
    
    if (String(optionId) === String(correctId)) {
      return [styles.option, styles.correctAnswer];
    }
    if (String(optionId) === String(selectedAnswerId) && String(optionId) !== String(correctId)) {
      return [styles.option, styles.wrongAnswer];
    }
    return styles.option;
  };

  if (randomizedQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  const renderHeaderRight = () => (
    <View style={styles.headerButtons}>
      <LanguageSwitcher
        value={selectedLanguage}
        onChange={handleChangeLanguage}
        languages={availableLanguages}
        compact
        triggerStyle={styles.languageButton}
        triggerTextStyle={{ color: 'white' }}
      />
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Header 
        username={username || null}
        pageTitle={quiz.title}
        navigation={navigation}
        titleOnly
      >
        {renderHeaderRight()}
      </Header>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{randomizedQuestions.length}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.endQuizButton}
          onPress={handleEndQuiz}
        >
          <Ionicons name="close-circle" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      {/* Question Box */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.questionBox}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {renderSignImage(currentQuestion)}
        <Text style={styles.questionText}>
          {getLanguageText(currentQuestion, selectedLanguage)}
        </Text>
      </LinearGradient>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getAnswerStyle(option, index)}
            onPress={() => handleAnswer(option, index)}
            disabled={selectedAnswerId !== null}
          >
            <Text style={styles.optionText}>
              {getOptionLanguageText(option, selectedLanguage, currentQuestion, index)}
            </Text>
            {selectedAnswerId && (
              <>
                {String(getOptionId(option, index)) === String(getCorrectAnswerId(currentQuestion)) && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
                {String(getOptionId(option, index)) === String(selectedAnswerId) && 
                 String(getOptionId(option, index)) !== String(getCorrectAnswerId(currentQuestion)) && (
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedAnswerId && getExplanationLanguageText(currentQuestion, selectedLanguage) ? (
        <View style={styles.explanationCard} accessibilityRole="summary">
          <View style={styles.explanationHeader}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary2} />
            <Text style={styles.explanationTitle}>Explanation</Text>
          </View>
          <Text style={styles.explanationBody}>
            {getExplanationLanguageText(currentQuestion, selectedLanguage)}
          </Text>
        </View>
      ) : null}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedAnswerId && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedAnswerId}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === randomizedQuestions.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Result Modal */}
      <Modal
        visible={showResult && !showReview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Result Header */}
              <View style={styles.modalHeader}>
                <Ionicons 
                  name={score >= randomizedQuestions.length * 0.7 ? 'trophy' : 'sad'} 
                  size={70} 
                  color={score >= randomizedQuestions.length * 0.7 ? '#ffc107' : '#dc3545'} 
                />
                <Text style={styles.modalTitle}>
                  {score >= randomizedQuestions.length * 0.7 ? 'Congratulations!' : 'Keep Practicing!'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {score >= randomizedQuestions.length * 0.7 
                    ? 'Great job! You passed the quiz!' 
                    : 'Keep studying! You\'ll improve with practice!'
                  }
                </Text>
              </View>

              {/* Statistics Display */}
              <View style={styles.modalContent}>
                <View style={styles.resultStats}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                    </View>
                    <Text style={styles.statLabel}>Correct</Text>
                    <Text style={styles.statValue}>{score}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="close-circle" size={24} color="#dc3545" />
                    </View>
                    <Text style={styles.statLabel}>Incorrect</Text>
                    <Text style={styles.statValue}>{randomizedQuestions.length - score}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="trophy" size={24} color="#ffc107" />
                    </View>
                    <Text style={styles.statLabel}>Accuracy</Text>
                    <Text style={styles.statValue}>{Math.round((score / randomizedQuestions.length) * 100)}%</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalFooter}>
                {incorrectAnswers.length > 0 && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.reviewButton]}
                    onPress={handleReviewMistakes}
                  >
                    <Ionicons name="eye" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.modalButtonText}>
                      Review Mistakes ({incorrectAnswers.length})
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.retryButton]}
                  onPress={handleRetry}
                >
                  <Ionicons name="refresh" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.modalButtonText}>Try Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.homeButton]}
                  onPress={() => {
                    setShowResult(false);
                    navigation.navigate('Main');
                  }}
                >
                  <Ionicons name="home" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.modalButtonText}>Home</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Review Mistakes Modal */}
      <Modal
        visible={showReview}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseReview}
      >
        <View style={styles.reviewModalOverlay}>
          <View style={styles.reviewModalContainer}>
            {/* Modal Header */}
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Incorrect Answers Review</Text>
              <TouchableOpacity
                style={styles.reviewCloseButton}
                onPress={handleCloseReview}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Modal Body with ScrollView */}
            <ScrollView 
              style={styles.reviewModalContent}
              contentContainerStyle={styles.reviewModalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {incorrectAnswers.map((item, index) => (
                <View key={index} style={styles.reviewQuestionCard}>
                  {/* Question Header */}
                  <View style={styles.reviewQuestionHeader}>
                    <Text style={styles.reviewQuestionNumber}>
                      Question {item.questionIndex + 1}
                    </Text>
                    <View style={styles.reviewQuestionStatus}>
                      <Ionicons name="close-circle" size={16} color="#dc3545" />
                      <Text style={styles.reviewQuestionStatusText}>Incorrect</Text>
                    </View>
                  </View>
                  
                  {/* Question Text */}
                  <Text style={styles.reviewQuestionText}>
                    {item.questionText || item.question.question || item.question.question_text}
                  </Text>
                  {item.questionUrdu && (
                    <Text style={styles.reviewQuestionTextUrdu}>{item.questionUrdu}</Text>
                  )}
                  
                  {/* Question Image */}
                  {item.imageUrl && (
                    <View style={styles.reviewImageContainer}>
                      {renderSignImage(item)}
                    </View>
                  )}
                  
                  {/* Answer Options */}
                  <View style={styles.reviewOptionsContainer}>
                    {item.question.options?.map((option, optionIndex) => {
                      const optionId = getOptionId(option, optionIndex);
                      const isCorrect = String(optionId) === String(item.correctAnswerId);
                      const isUserChoice = String(optionId) === String(item.selectedAnswerId);
                      const optionText = getOptionText(option);
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
                          
                          {/* Status Icons */}
                          {isCorrect && (
                            <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                          )}
                          {isUserChoice && !isCorrect && (
                            <Ionicons name="close-circle" size={20} color="#dc3545" />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
              
              {/* Empty state */}
              {incorrectAnswers.length === 0 && (
                <View style={styles.emptyReviewContainer}>
                  <Ionicons name="checkmark-circle" size={64} color="#28a745" />
                  <Text style={styles.emptyReviewText}>Perfect Score!</Text>
                  <Text style={styles.emptyReviewSubText}>You answered all questions correctly.</Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.reviewModalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeReviewButton]}
                onPress={handleCloseReview}
              >
                <Text style={styles.modalButtonText}>Close</Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Ensure content doesn't get cut off
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    marginRight: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
  },
  endQuizButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9F43',
    borderRadius: 4,
  },
  progressText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 45,
    textAlign: 'right',
  },
  questionBox: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 28,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 16,
  },
  signImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  optionsContainer: {
    padding: 16,
  },
  option: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  correctAnswer: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  wrongAnswer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  explanationCard: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary2,
  },
  explanationBody: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginTop: 20, // Add extra top margin
    marginBottom: 20, // Add extra bottom margin
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  scoreText: {
    fontSize: 20,
    color: '#666',
    marginTop: 8,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  homeButton: {
    backgroundColor: '#FF9F43',
  },
  reviewButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxWidth: '100%',
    maxHeight: '90%',
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalScoreText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  modalPercentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Review Modal styles
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxHeight: '85%',
    width: '95%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
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
  reviewModalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModalContent: {
    flex: 1,
    padding: 20,
  },
  reviewModalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mistakeItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  mistakeImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  mistakeDetails: {
    flex: 1,
  },
  mistakeQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  answerContainer: {
    gap: 8,
  },
  answerBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  wrongAnswerBox: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  correctAnswerBox: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  wrongAnswerText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  reviewModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  closeReviewButton: {
    backgroundColor: '#666',
    minWidth: 120,
  },
  
  // New styles for improved result screen and review modal
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Statistics display
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Button icon
  buttonIcon: {
    marginRight: 8,
  },
  
  // Review modal styles
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
  },
  reviewImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
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
  },
  reviewCorrectOptionText: {
    color: '#28a745',
    fontWeight: '600',
  },
  reviewIncorrectOptionText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  
  // Empty state
  emptyReviewContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyReviewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 16,
  },
  emptyReviewSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Quiz; 