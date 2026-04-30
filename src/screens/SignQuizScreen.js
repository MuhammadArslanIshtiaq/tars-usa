import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useQuiz } from '../contexts/QuizContext';
import { useUser } from '../contexts/UserContext';
import { useAdMob } from '../hooks/useAdMob';
import { COLORS } from '../theme/colors';

const SignQuizScreen = ({ navigation, route }) => {
  const { username, saveQuizResult } = useUser();
  const { getCategoryQuiz, shuffleArray } = useQuiz();
  const { authority, category, categoryName } = route.params;
  const { showAd } = useAdMob();
  

  
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



  // Helper functions for option handling
  const getOptionId = (option, index) => {
    return option.id || option.option_id || String.fromCharCode(65 + index);
  };

  const getOptionText = (option) => {
    return option.text || option.option_text || option.choice || option.answer;
  };

  const getOptionTextUrdu = (option) => {
    return option.text_urdu || option.option_text_urdu || option.choice_urdu;
  };

  const getCorrectAnswerId = (question) => {
    // Check if options have is_correct property (new structure)
    if (question.options && Array.isArray(question.options)) {
      const correctIndex = question.options.findIndex(opt => opt.is_correct === true);
      if (correctIndex >= 0) {
        return String.fromCharCode(65 + correctIndex);
      }
    }
    
    // Fallback for object-based structure
    return question.correct_answer_id || question.correct_option_id || 
           question.answer || question.right_answer || null;
  };

  // Function to reset quiz state
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedAnswerId(null);
    setScore(0);
    setShowResult(false);
    setIncorrectAnswers([]);
    setShowReviewModal(false);
  };

  // Fetch questions from cached data first, fallback to API
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        // Try to get cached quiz data first
        const cachedQuestions = getCategoryQuiz(category);
        
        if (cachedQuestions && cachedQuestions.length > 0) {
          // Shuffle options for each question to randomize order
          const shuffledQuizData = cachedQuestions.map(question => ({
            ...question,
            options: shuffleArray(question.options || [])
          }));
          setQuestions(shuffledQuizData);
    } else {
          // No cached data available, show error
          setError('No quiz data available for this category');
        }
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [category]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Debug effect to track question changes
  useEffect(() => {
    if (currentQuestion) {
      // Debug image source details
      if (currentQuestion.image_url) {
        // Special logging for problematic questions
        if ([6, 21, 23].includes(currentQuestionIndex + 1)) {
          }
      } else {
        }
    }
  }, [currentQuestionIndex, currentQuestion]);

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
      const correctAnswerText = getOptionText(correctOption);

      // Debug: Show what we're storing in incorrect answers (visual)
      Alert.alert(
        'Debug: Storing Incorrect Answer',
        `Question Index: ${currentQuestionIndex}\n` +
        `Image Path: ${currentQuestion.image_path || 'NONE'}\n` +
        `Image URL: ${currentQuestion.image_url || 'NONE'}\n` +
        `Question Keys: ${Object.keys(currentQuestion).join(', ')}`,
        [{ text: 'OK' }]
      );

      setIncorrectAnswers(prev => [...prev, {
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        questionText: currentQuestion.question || currentQuestion.question_text,
        questionUrdu: currentQuestion.question_urdu,
        selectedAnswerId: answerId,
        selectedAnswer: userAnswerText,
        correctAnswerId: String(correctId),
        correctAnswer: correctAnswerText,
        imagePath: currentQuestion.image_path
      }]);
    }
  };

  // Navigation
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
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // Calculate time spent
      
      await saveQuizResult({
        quizId: `${authority?.code || authority?.name || 'unknown'}-${category}`,
        title: `${categoryName || category} - ${authority?.name || authority?.code || 'Unknown Authority'}`,
        score: percentage,
        totalQuestions: questions.length,
        correctAnswers: score,
        timeSpent: timeSpent
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
    
    // Show interstitial ad when quiz is completed
    try {
      await showAd();
    } catch (error) {
      console.log('Ad not available or failed to show');
    }
    
    // Show results screen
    setShowResult(true);
  };

  const handleRetryQuiz = () => {
    resetQuiz();
  };

  const handleGoToQuizzes = () => {
    navigation.navigate('Home');
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtons}>
      {!showResult && !loading && questions.length > 0 && (
      <TouchableOpacity 
          style={styles.finishQuizButton}
          onPress={handleFinishQuiz}
        >
          <Text style={styles.finishQuizButtonText}>Finish</Text>
      </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={[styles.headerButton, !showResult && !loading && questions.length > 0 && { marginLeft: 8 }]}
        onPress={() => {
          if (!showResult && currentQuestionIndex > 0) {
            Alert.alert(
              'Leave Quiz?',
              'Are you sure you want to leave? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave Quiz', style: 'destructive', onPress: () => navigation.goBack() }
              ]
            );
          } else {
            navigation.goBack();
          }
        }}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  // Check if this is a rules quiz (no images needed)
  const isRulesQuiz = category === 'rules1' || category === 'rules2';

  // Function to get percentage color based on score
  const getPercentageColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return '#28a745'; // Green for excellent
    if (percentage >= 80) return '#17a2b8'; // Blue for good
    if (percentage >= 70) return '#ffc107'; // Yellow for pass
    if (percentage >= 60) return '#fd7e14'; // Orange for below average
    return '#dc3545'; // Red for poor
  };

  const getLocalImageMap = () => {
    // Exact copy from working RoadSignsScreen
    return {
      // Regulatory Road Signs
      '60kmh-minimum-speed-limit-freeway.png': require('../../assets/images/signs/regulatory-road-signs/60kmh-minimum-speed-limit-freeway.png'),
      'Ahead-only.png': require('../../assets/images/signs/regulatory-road-signs/Ahead-only.png'),
      'Freeway-begins.png': require('../../assets/images/signs/regulatory-road-signs/Freeway-begins.png'),
      'Freeway-ends.png': require('../../assets/images/signs/regulatory-road-signs/Freeway-ends.png'),
      'Give-Way.png': require('../../assets/images/signs/regulatory-road-signs/Give-Way.png'),
      'Handicapped-Parking.png': require('../../assets/images/signs/regulatory-road-signs/Handicapped-Parking.png'),
      'keep-left.png': require('../../assets/images/signs/regulatory-road-signs/keep-left.png'),
      'keep-right.png': require('../../assets/images/signs/regulatory-road-signs/keep-right.png'),
      'Lorries-prohibited.png': require('../../assets/images/signs/regulatory-road-signs/Lorries-prohibited.png'),
      'Maximum-Gross weight-limit.png': require('../../assets/images/signs/regulatory-road-signs/Maximum-Gross weight-limit.png'),
      'Maximum-Height-limit.png': require('../../assets/images/signs/regulatory-road-signs/Maximum-Height-limit.png'),
      'Maximum-speed-limit.png': require('../../assets/images/signs/regulatory-road-signs/Maximum-speed-limit.png'),
      'Maximum-width-limit.png': require('../../assets/images/signs/regulatory-road-signs/Maximum-width-limit.png'),
      'No-cyclists.png': require('../../assets/images/signs/regulatory-road-signs/No-cyclists.png'),
      'No-entry.png': require('../../assets/images/signs/regulatory-road-signs/No-entry.png'),
      'No-Hazardous-materials.png': require('../../assets/images/signs/regulatory-road-signs/No-Hazardous-materials.png'),
      'No-left-turn.png': require('../../assets/images/signs/regulatory-road-signs/No-left-turn.png'),
      'No-overtaking.png': require('../../assets/images/signs/regulatory-road-signs/No-overtaking.png'),
      'No-pedestrians.png': require('../../assets/images/signs/regulatory-road-signs/No-pedestrians.png'),
      'No-right-turn.png': require('../../assets/images/signs/regulatory-road-signs/No-right-turn.png'),
      'No-uturn.png': require('../../assets/images/signs/regulatory-road-signs/No-uturn.png'),
      'Pass-either-side.png': require('../../assets/images/signs/regulatory-road-signs/Pass-either-side.png'),
      'Priority-to-oncoming-traffic.png': require('../../assets/images/signs/regulatory-road-signs/Priority-to-oncoming-traffic.png'),
      'Roundabout.png': require('../../assets/images/signs/regulatory-road-signs/Roundabout.png'),
      'Stop.png': require('../../assets/images/signs/regulatory-road-signs/Stop.png'),
      'Turn-left-ahead.png': require('../../assets/images/signs/regulatory-road-signs/Turn-left-ahead.png'),
      'Turn-left.png': require('../../assets/images/signs/regulatory-road-signs/Turn-left.png'),
      'Turn-right-ahead.png': require('../../assets/images/signs/regulatory-road-signs/Turn-right-ahead.png'),
      'Turn-right.png': require('../../assets/images/signs/regulatory-road-signs/Turn-right.png'),
      'Use-of-horn-prohibited.png': require('../../assets/images/signs/regulatory-road-signs/Use-of-horn-prohibited.png'),
      'Used-in-temporary-situations.png': require('../../assets/images/signs/regulatory-road-signs/Used-in-temporary-situations.png'),
      'You-must-go-this-way.png': require('../../assets/images/signs/regulatory-road-signs/You-must-go-this-way.png'),

      
      // Guide Signs
      'Count-down-markers.png': require('../../assets/images/signs/guide-signs/Count-down-markers.png'),
      'Deadend-on-Left.png': require('../../assets/images/signs/guide-signs/Deadend-on-Left.png'),
      'Directions-to-Freeways.png': require('../../assets/images/signs/guide-signs/Directions-to-Freeways.png'),
      'Diversion-of-traffic-route.png': require('../../assets/images/signs/guide-signs/Diversion-of-traffic-route.png'),
      'Do-not-enter-junction-until-exit-is-clear.png': require('../../assets/images/signs/guide-signs/Do-not-enter-junction-until-exit-is-clear.png'),
      'Go-Signal.png': require('../../assets/images/signs/guide-signs/Go-Signal.png'),
      'Hospital.png': require('../../assets/images/signs/guide-signs/Hospital.png'),
      'Lane-ahead-closed.png': require('../../assets/images/signs/guide-signs/Lane-ahead-closed.png'),
      'Lane-ahead-open.png': require('../../assets/images/signs/guide-signs/Lane-ahead-open.png'),
      'Point-of-no-return-yellow-signal.png': require('../../assets/images/signs/guide-signs/Point-of-no-return-yellow-signal.png'),
      'Priority-over-vehicles-from-opposite-direction.png': require('../../assets/images/signs/guide-signs/Priority-over-vehicles-from-opposite-direction.png'),
      'Proceed-to-U-turn-only.png': require('../../assets/images/signs/guide-signs/Proceed-to-U-turn-only.png'),
      'Reduce-speed-now.png': require('../../assets/images/signs/guide-signs/Reduce-speed-now.png'),
      'Road-clear.png': require('../../assets/images/signs/guide-signs/Road-clear.png'),
      'Stop-in-red-direction-may-proceed-in-green-direction.png': require('../../assets/images/signs/guide-signs/Stop-in-red-direction-may-proceed-in-green-direction.png'),
      'Stop-Signal.png': require('../../assets/images/signs/guide-signs/Stop-Signal.png'),
      'Variable-Message-Signs.png': require('../../assets/images/signs/guide-signs/Variable-Message-Signs.png'),

      // Road Markings
      'Areas-to-separate-traffic-movements.png': require('../../assets/images/signs/road-marking/Areas-to-separate-traffic-movements.png'),
      'Box-Junctions.png': require('../../assets/images/signs/road-marking/Box-Junctions.png'),
      'Broken-White-Lines.png': require('../../assets/images/signs/road-marking/Broken-White-Lines.png'),
      'Broken-Yellow-Lines.png': require('../../assets/images/signs/road-marking/Broken-Yellow-Lines.png'),
      'Bus-Stop-Marking.png': require('../../assets/images/signs/road-marking/Bus-Stop-Marking.png'),
      'Give-Way-Line.png': require('../../assets/images/signs/road-marking/Give-Way-Line.png'),
      'Keep-Entrance-Clear.png': require('../../assets/images/signs/road-marking/Keep-Entrance-Clear.png'),
      'No-Passing-Line.png': require('../../assets/images/signs/road-marking/No-Passing-Line.png'),
      'Pedestrian-crossing-on-a-dual-carriageway.png': require('../../assets/images/signs/road-marking/Pedestrian-crossing-on-a-dual-carriageway.png'),
      'Pedestrian-crossing-on-a-single-carriageway.png': require('../../assets/images/signs/road-marking/Pedestrian-crossing-on-a-single-carriageway.png'),
      'Rumble-strips.png': require('../../assets/images/signs/road-marking/Rumble-strips.png'),
      'Solid-line-on-one-side-and-broken-on-the-other.png': require('../../assets/images/signs/road-marking/Solid-line-on-one-side-and-broken-on-the-other.png'),
      'Solid-Lines-Double.png': require('../../assets/images/signs/road-marking/Solid-Lines-Double.png'),
      'Speed-Hump-Marking.png': require('../../assets/images/signs/road-marking/Speed-Hump-Marking.png'),
      'Stop-Line.png': require('../../assets/images/signs/road-marking/Stop-Line.png'),
      'Zig-Zag-Zone-Line.png': require('../../assets/images/signs/road-marking/Zig-Zag-Zone-Line.png'),
    };
  };

  const renderImage = (imagePath) => {
    // Don't render image for rules quizzes
    if (isRulesQuiz) {
      return null;
    }

    if (!imagePath) return null;

    // Get local image mapping - exact same as MockQuizScreen
    const localImageMap = getLocalImageMap();
    const localImage = localImageMap[imagePath];

    if (localImage) {
      return (
        <Image 
          source={localImage}
          style={styles.signImage}
          resizeMode="contain"
        />
      );
    }

    // If no local image found, return null
    return null;
  };

  const renderImageForReview = (imagePath) => {
    if (!imagePath) {
      return (
        <View style={{padding: 10, backgroundColor: '#ffebee'}}>
          <Text style={{color: 'red', fontSize: 12}}>❌ No imagePath provided</Text>
        </View>
      );
    }

    // Get local image mapping - exact same as MockQuizScreen
    const localImageMap = getLocalImageMap();
    const localImage = localImageMap[imagePath];
    const matchingKey = Object.keys(localImageMap).find(key => key === imagePath);

    return (
      <View>
        {/* Visual Debug Info */}
        <Text style={{color: 'purple', fontSize: 10, marginBottom: 5}}>
          DEBUG: Image path: {imagePath}
        </Text>
        <Text style={{color: 'purple', fontSize: 10, marginBottom: 5}}>
          DEBUG: Has local image: {localImage ? 'YES' : 'NO'}
        </Text>
        <Text style={{color: 'purple', fontSize: 10, marginBottom: 5}}>
          DEBUG: Matching key: {matchingKey || 'NONE'}
        </Text>
        
        {localImage ? (
          <View>
            <Text style={{color: 'green', fontSize: 10, marginBottom: 5}}>
              ✅ Using local image
            </Text>
            <Image
              source={localImage}
              style={styles.reviewImage}
              resizeMode="contain"
              onError={(error) => {
                // Visual error indicator
                return (
                  <View style={{padding: 10, backgroundColor: '#ffebee'}}>
                    <Text style={{color: 'red', fontSize: 12}}>❌ Local image load error</Text>
                  </View>
                );
              }}
              onLoad={() => {
                // Visual success indicator could be added here if needed
              }}
          />
        </View>
        ) : (
          <View style={{padding: 10, backgroundColor: '#ffebee'}}>
            <Text style={{color: 'red', fontSize: 12}}>❌ Image not found locally</Text>
          </View>
        )}
      </View>
    );
  };

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      return <Text>Loading question...</Text>;
    }
    
    // Debug: Log question data to check Urdu content and image path
    return (
      <View style={styles.questionContainer}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
        </View>
      <ScrollView 
        style={styles.questionContent}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.questionContentContainer}
      >
        <Text style={[styles.questionText, isRulesQuiz && styles.questionTextRules]}>
          {currentQuestion.question || currentQuestion.question_text || currentQuestion.title || currentQuestion.text}
        </Text>
        {(currentQuestion.question_urdu || currentQuestion.question_urdu_text || currentQuestion.title_urdu || currentQuestion.text_urdu) && (
          <Text style={[styles.questionTextUrdu, isRulesQuiz && styles.questionTextUrduRules]}>
            {currentQuestion.question_urdu || currentQuestion.question_urdu_text || currentQuestion.title_urdu || currentQuestion.text_urdu}
          </Text>
        )}
        {!isRulesQuiz && currentQuestion.image_path && (
          <View style={styles.imageContainer}>
            {renderImage(currentQuestion.image_path)}
          </View>
        )}

        <View style={styles.optionsContainer}>
          {(currentQuestion.options || currentQuestion.choices || currentQuestion.answers || []).map((option, index) => {
            // Extract option text properly
            const optionText = option.text || option.option_text || option.choice || option.answer || option.answer_text || `Option ${String.fromCharCode(65 + index)}`;
            const optionTextUrdu = option.text_urdu || option.option_urdu || option.choice_urdu || option.answer_urdu || option.answer_text_urdu || '';
            
            // Debug: Log option details for rules quizzes
            if (isRulesQuiz && index === 0) {
              }
            
      return (
    <TouchableOpacity
                key={option.id || option.answer_id || index}
                style={[
                  styles.optionButton,
                  selectedAnswerId === getOptionId(option, index) && styles.selectedOption
                ]}
                onPress={() => handleAnswer(option, index)}
                disabled={selectedAnswerId !== null}
              >
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>
                    {optionText}
                  </Text>
                  {optionTextUrdu && (
                    <Text style={styles.optionTextUrdu}>
                      {optionTextUrdu}
                    </Text>
                  )}
        </View>
                {selectedAnswerId && (
                  <>
                    {String(getOptionId(option, index)) === String(getCorrectAnswerId(currentQuestion)) && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.optionIcon} />
                    )}
                    {String(getOptionId(option, index)) === String(selectedAnswerId) && 
                     String(getOptionId(option, index)) !== String(getCorrectAnswerId(currentQuestion)) && (
                      <Ionicons name="close-circle" size={24} color="#F44336" style={styles.optionIcon} />
                    )}
                  </>
                )}
      </TouchableOpacity>
            );
          })}
        </View>

              <TouchableOpacity 
          style={[styles.nextButton, !selectedAnswerId && styles.disabledButton]}
          onPress={handleNextQuestion}
          disabled={!selectedAnswerId}
              >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Text>
              </TouchableOpacity>
      </ScrollView>
      </View>
    );
    }

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
          <Text style={styles.modalTitle}>Finish Quiz Early?</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to finish the quiz now? You're on question {currentQuestionIndex + 1} of {questions.length}.
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
              <Text style={styles.confirmButtonText}>Finish Quiz</Text>
      </TouchableOpacity>
        </View>
        </View>
      </View>
    </Modal>
  );

  const renderResult = () => (
    <View style={styles.resultContainer}>
      {/* Result Header */}
      <View style={styles.resultHeader}>
        <Ionicons 
          name={score >= questions.length * 0.7 ? 'trophy' : 'sad'} 
          size={80} 
          color={score >= questions.length * 0.7 ? '#ffc107' : '#dc3545'} 
        />
        <Text style={styles.resultTitle}>
          {score >= questions.length * 0.7 ? 'Congratulations!' : 'Keep Practicing!'}
        </Text>
        <Text style={styles.resultSubtitle}>
          {score >= questions.length * 0.7 
            ? 'Great job! You passed the quiz!' 
            : 'Keep studying! You\'ll improve with practice!'
          }
        </Text>
      </View>
      
      {/* Statistics Display */}
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
          <Text style={styles.statValue}>{questions.length - score}</Text>
    </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trophy" size={24} color="#ffc107" />
          </View>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>{Math.round((score / questions.length) * 100)}%</Text>
        </View>
      </View>

      {/* Review Button (only if there are incorrect answers) */}
      {incorrectAnswers.length > 0 && (
        <TouchableOpacity 
          style={[styles.resultButton, styles.reviewButton]}
          onPress={() => setShowReviewModal(true)}
        >
          <Ionicons name="eye" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.resultButtonText}>
            Review Incorrect Answers ({incorrectAnswers.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      <View style={styles.resultButtons}>
            <TouchableOpacity
          style={[styles.resultButton, styles.retryButton]}
          onPress={handleRetryQuiz}
        >
          <Ionicons name="refresh" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.resultButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewModal = () => (
    <Modal
      visible={showReviewModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowReviewModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.reviewModalContent}>
          {/* Modal Header */}
          <View style={styles.reviewModalHeader}>
            <Text style={styles.reviewModalTitle}>Incorrect Answers Review</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReviewModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Modal Body with ScrollView */}
          <ScrollView style={styles.reviewModalBody} showsVerticalScrollIndicator={false}>
            {incorrectAnswers.map((item, index) => {
              const question = item.question;
              const questionUrdu = item.questionUrdu || '';
              
              // Debug: Log all data for this incorrect answer
              console.log('🔍 Review Modal Debug - Item:', index, {
                itemKeys: Object.keys(item),
                questionKeys: question ? Object.keys(question) : 'No question object',
                questionImagePath: question?.image_path,
                itemImagePath: item.imagePath,
                questionImageUrl: question?.image_url,
                itemImageUrl: item.imageUrl,
                fullQuestion: question
              });
              
              return (
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
                    {item.questionText || question.question || question.question_text}
                  </Text>
                  {questionUrdu && (
                    <Text style={styles.reviewQuestionTextUrdu}>{questionUrdu}</Text>
                  )}
                  
                  {/* Question Image */}
                  {question?.image_path && (
                    <View style={styles.reviewImageContainer}>
                      {renderImageForReview(question.image_path)}
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
              );
            })}
            
            {/* Empty state */}
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle={categoryName}
        titleOnly
      >
        {renderHeaderRight()}
      </Header>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a5f3a" />
            <Text style={styles.loadingText}>Loading quiz questions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
        ) : questions.length === 0 ? (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={64} color="#666" />
            <Text style={styles.errorText}>No questions available for this category</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : showResult ? renderResult() : renderQuestion()}
      </ScrollView>
      
      {/* Render the finish confirmation modal */}
      {renderFinishConfirmation()}
      
      {/* Render the review modal */}
      {renderReviewModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 20, // Ensure content doesn't get cut off
  },
  quizProgress: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
    width: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizProgressText: {
    fontSize: 14,
    color: '#1a5f3a',
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionInfo: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a5f3a',
    borderRadius: 2,
  },

  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5f3a',
  },
  questionContent: {
    flex: 1,
  },
  questionContentContainer: {
    paddingBottom: 100, // Increased padding to ensure next button is visible
    flexGrow: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  questionTextUrdu: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    writingDirection: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
  },
  questionTextRules: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 28,
  },
  questionTextUrduRules: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 26,
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  signImage: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  signImageEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
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
  selectedOption: {
    borderColor: '#1a5f3a',
    backgroundColor: '#f0f8f0',
  },
  optionIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTextUrdu: {
    fontSize: 14,
    color: '#666',
    writingDirection: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20, // Add margin to ensure button is visible
    marginBottom: 20, // Add bottom margin for better spacing
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Result Screen Styles
  resultContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    justifyContent: 'center',
  },
  
  // Result header
  resultHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  resultSubtitle: {
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
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  finishButton: {
    backgroundColor: '#1a5f3a',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
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
    marginLeft: 16,
  },
  finishQuizButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Buttons
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  reviewButton: {
    backgroundColor: '#6f42c1',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007bff',
  },
  quizzesButton: {
    backgroundColor: '#28a745',
  },
  buttonIcon: {
    marginRight: 8,
  },
  resultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  // Review Modal Styles
  reviewButton: {
    backgroundColor: '#6f42c1',
    marginBottom: 16,
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
    height: 200,
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
});

export default SignQuizScreen;
