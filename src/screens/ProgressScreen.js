import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors';

const ProgressScreen = ({ navigation }) => {
  const { username, userStats, quizHistory, loadUserData } = useUser();
  const [achievements, setAchievements] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });

  const screenWidth = Dimensions.get('window').width;

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  useEffect(() => {
    if (quizHistory && quizHistory.length > 0) {
      calculateAchievements();
      calculateStreaks();
      setRecentQuizzes(quizHistory.slice(0, 5)); // Last 5 quizzes
    } else {
      setAchievements([]);
      setRecentQuizzes([]);
      setStreakData({ currentStreak: 0, longestStreak: 0 });
    }
  }, [quizHistory, userStats]);

  const calculateAchievements = () => {
    const achievementsList = [];

    // Perfect Score Achievement
    const perfectScores = quizHistory.filter(quiz => 
      quiz.correctAnswers === quiz.totalQuestions
    ).length;
    
    if (perfectScores >= 1) {
      achievementsList.push({
        id: 'perfect_score',
        title: 'Perfect Score',
        description: `Achieved ${perfectScores} perfect score${perfectScores > 1 ? 's' : ''}`,
        icon: 'star',
        color: '#FFD700',
        unlocked: true,
        progress: perfectScores
      });
    }

    // Quiz Master Achievement
    if (userStats.quizzesTaken >= 10) {
      achievementsList.push({
        id: 'quiz_master',
        title: 'Quiz Master',
        description: `Completed ${userStats.quizzesTaken} quizzes`,
        icon: 'school',
        color: '#4CAF50',
        unlocked: true,
        progress: userStats.quizzesTaken
      });
    }

    // High Achiever (Average > 80%)
    if (userStats.averageScore >= 80) {
      achievementsList.push({
        id: 'high_achiever',
        title: 'High Achiever',
        description: `${userStats.averageScore}% average score`,
        icon: 'trophy',
        color: '#FF6B35',
        unlocked: true,
        progress: userStats.averageScore
      });
    }

    // Streak achievements
    if (streakData.currentStreak >= 7) {
      achievementsList.push({
        id: 'week_streak',
        title: '7-Day Streak',
        description: `${streakData.currentStreak} day current streak`,
        icon: 'flame',
        color: '#FF4444',
        unlocked: true,
        progress: streakData.currentStreak
      });
    }

    // Sign Master (100+ points)
    if (userStats.totalPoints >= 100) {
      achievementsList.push({
        id: 'sign_master',
        title: 'Sign Master',
        description: `Earned ${userStats.totalPoints} total points`,
        icon: 'medal',
        color: '#9C27B0',
        unlocked: true,
        progress: userStats.totalPoints
      });
    }

    setAchievements(achievementsList);
  };

  const calculateStreaks = () => {
    if (!quizHistory || quizHistory.length === 0) {
      setStreakData({ currentStreak: 0, longestStreak: 0 });
      return;
    }

    // Sort quizzes by date (most recent first)
    const sortedQuizzes = [...quizHistory].sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB - dateA;
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    sortedQuizzes.forEach((quiz, index) => {
      const quizDate = quiz.timestamp instanceof Date ? quiz.timestamp : new Date(quiz.timestamp);
      const dayOnly = quizDate.toDateString();

      if (index === 0) {
        // First quiz (most recent)
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (dayOnly === today || dayOnly === yesterday) {
          currentStreak = 1;
          tempStreak = 1;
        }
        lastDate = dayOnly;
      } else {
        const prevDate = new Date(lastDate);
        const currentDate = new Date(dayOnly);
        const dayDiff = Math.abs((prevDate - currentDate) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          // Consecutive day
          tempStreak++;
          if (index === 1) currentStreak = tempStreak;
        } else {
          // Streak broken
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          if (index === 1) currentStreak = 0;
        }
        lastDate = dayOnly;
      }
    });

    longestStreak = Math.max(longestStreak, tempStreak);
    setStreakData({ currentStreak, longestStreak });
  };

  const handleRefresh = () => {
    loadUserData();
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh progress"
        >
          <Ionicons name="refresh" size={20} color={COLORS.primary2} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={styles.statIconWrap}>
            <Ionicons name="reader-outline" size={18} color={COLORS.primary2} />
          </View>
          <Text style={styles.statNumber}>{userStats.quizzesTaken}</Text>
          <Text style={styles.statLabel}>Quizzes Taken</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIconWrap}>
            <Ionicons name="sparkles-outline" size={18} color={COLORS.accent} />
          </View>
          <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIconWrap}>
            <Ionicons name="speedometer-outline" size={18} color={COLORS.primary2} />
          </View>
          <Text style={styles.statNumber}>{userStats.averageScore.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIconWrap}>
            <Ionicons name="flame-outline" size={18} color={COLORS.accent} />
          </View>
          <Text style={styles.statNumber}>{streakData.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>
    </View>
  );

  const renderAchievementCard = ({ item }) => (
    <LinearGradient
      colors={[item.color + '20', item.color + '10']}
      style={styles.achievementCard}
    >
      <View style={[styles.achievementIcon, { backgroundColor: item.color + '30' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{item.title}</Text>
        <Text style={styles.achievementDescription}>{item.description}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={20} color={item.color} />
    </LinearGradient>
  );

  const renderRecentQuizCard = ({ item, index }) => {
    const score = ((item.correctAnswers / item.totalQuestions) * 100).toFixed(0);
    const isPerfect = item.correctAnswers === item.totalQuestions;
    const quizDate = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);
    const date = quizDate.toLocaleDateString();

    return (
      <View style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.quizDate}>{date}</Text>
        </View>
        <View style={styles.quizStats}>
          <View style={styles.quizScoreContainer}>
            <Text style={[styles.quizScore, isPerfect && styles.perfectScore]}>
              {score}%
            </Text>
            {isPerfect && <Ionicons name="star" size={16} color="#FFD700" />}
          </View>
          <Text style={styles.quizDetails}>
            {item.correctAnswers}/{item.totalQuestions} correct
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle="Progress"
      />
      
      <FlatList
        data={[{ type: 'content' }]}
        renderItem={() => (
      <View style={styles.content}>
            {/* Stats Overview */}
            {renderStatsCard()}

            {/* Achievements Section */}
            {achievements.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Achievements</Text>
                  <View style={styles.achievementCount}>
                    <Text style={styles.achievementCountText}>{achievements.length}</Text>
                  </View>
                </View>
                <FlatList
                  data={achievements}
                  renderItem={renderAchievementCard}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Recent Quizzes */}
            {recentQuizzes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Quizzes</Text>
                <View style={{ height: 16 }} />
                <FlatList
                  data={recentQuizzes}
                  renderItem={renderRecentQuizCard}
                  keyExtractor={(item, index) => `${item.quizId}-${index}`}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Empty State */}
            {userStats.quizzesTaken === 0 && (
              <View style={styles.emptyState}>
        <Ionicons name="stats-chart-outline" size={64} color="#94a3b8" />
                <Text style={styles.emptyTitle}>Start Your Journey</Text>
                <Text style={styles.emptyDescription}>
                  Take your first quiz to begin tracking your progress and earning achievements!
        </Text>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => navigation.navigate('Home')}
                  accessibilityRole="button"
                  accessibilityLabel="Go to Home to take a quiz"
                >
                  <Text style={styles.startButtonText}>Take a Quiz</Text>
                </TouchableOpacity>
              </View>
            )}
      </View>
        )}
        keyExtractor={() => 'progress-content'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  
  // Stats Card Styles
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  // Achievement Styles
  achievementCount: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  achievementCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },

  // Quiz Card Styles
  quizCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  quizDate: {
    fontSize: 12,
    color: '#999',
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 4,
  },
  perfectScore: {
    color: '#FFD700',
  },
  quizDetails: {
    fontSize: 14,
    color: '#666',
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;
