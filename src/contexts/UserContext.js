import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    state: '',
    category: 'car',
    language: 'en',
  });
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    quizzesTaken: 0,
    averageScore: 0
  });

  const loadUserData = useCallback(async () => {
    try {
      // Load username
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }

      const storedPreferences = await AsyncStorage.getItem('preferences');
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences);
        setPreferences((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
      
      // Load quiz history
      const historyData = await AsyncStorage.getItem('quizHistory');
      if (historyData) {
        const history = JSON.parse(historyData);
        setQuizHistory(history);
        
        // Calculate stats from history
        if (history.length > 0) {
          const totalPoints = history.reduce((sum, quiz) => sum + quiz.score, 0);
          const averageScore = totalPoints / history.length;
          setUserStats({
            totalPoints,
            quizzesTaken: history.length,
            averageScore
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user data from local storage on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const updatePreferences = useCallback(async (nextPreferences) => {
    try {
      const merged = {
        ...preferences,
        ...nextPreferences,
      };
      await AsyncStorage.setItem('preferences', JSON.stringify(merged));
      setPreferences(merged);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }, [preferences]);

  const updateUsername = useCallback(async (newUsername) => {
    try {
      await AsyncStorage.setItem('username', newUsername);
      setUsername(newUsername);
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  }, []);

  const saveQuizResult = useCallback(async (quizData) => {
    try {
      // Create quiz result object with unique id
      const quizResult = {
        id: Date.now().toString(), // Unique identifier for each quiz attempt
        quizId: quizData.quizId,
        title: quizData.title,
        score: quizData.score,
        totalQuestions: quizData.totalQuestions,
        correctAnswers: quizData.correctAnswers,
        timeSpent: quizData.timeSpent,
        timestamp: new Date().toISOString()
      };

      // Get existing quiz history
      const existingHistory = await AsyncStorage.getItem('quizHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Add new result at the beginning
      history.unshift(quizResult);
      
      // Keep only last 50 results
      const limitedHistory = history.slice(0, 50);
      
      // Save back to storage
      await AsyncStorage.setItem('quizHistory', JSON.stringify(limitedHistory));
      
      // Update local state
      setQuizHistory(limitedHistory);
      
      // Recalculate stats
      const totalPoints = limitedHistory.reduce((sum, quiz) => sum + quiz.score, 0);
      const averageScore = totalPoints / limitedHistory.length;
      setUserStats({
        totalPoints,
        quizzesTaken: limitedHistory.length,
        averageScore
      });
      
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw new Error('Failed to save quiz result. Please try again.');
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('quizHistory');
      setQuizHistory([]);
      setUserStats({
        totalPoints: 0,
        quizzesTaken: 0,
        averageScore: 0
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    username,
    loading,
    quizHistory,
    userStats,
    preferences,
    updateUsername,
    updatePreferences,
    saveQuizResult,
    clearHistory,
    loadUserData,
  }), [
    username,
    loading,
    quizHistory,
    userStats,
    preferences,
    updateUsername,
    updatePreferences,
    saveQuizResult,
    clearHistory,
    loadUserData,
  ]);

  if (loading) {
    return null;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 
