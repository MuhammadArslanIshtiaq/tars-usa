import React, { createContext, useContext, useEffect, useState } from 'react';
import { dummyQuizzes } from '../data/dummy-quiz-data';

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use dummy data for local development
      const allQuizzes = {
        categories: {
          mandatory: {
            id: 'mandatory',
            title: 'Mandatory Road Signs',
            questions: dummyQuizzes.uae.questions.slice(0, 3) // Use first 3 questions for mandatory
          },
          warning: {
            id: 'warning', 
            title: 'Warning Road Signs',
            questions: dummyQuizzes.uae.questions.slice(1, 4) // Use middle 3 questions for warning
          },
          informatory: {
            id: 'informatory',
            title: 'Informatory Road Signs', 
            questions: dummyQuizzes.uae.questions.slice(2, 5) // Use last 3 questions for informatory
          }
        }
      };
      
      setQuizzes(allQuizzes);
      
    } catch (error) {
      console.error('❌ Error loading dummy quizzes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryQuiz = (category) => {
    return quizzes.categories?.[category] || [];
  };
  
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Initialize quizzes on mount
  useEffect(() => {
    fetchAllQuizzes();
  }, []);

  const value = {
    quizzes,
    loading,
    error,
    getCategoryQuiz,
    shuffleArray,
    refetchQuizzes: fetchAllQuizzes
  };
  
  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};