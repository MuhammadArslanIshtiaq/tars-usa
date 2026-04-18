import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import QuizLoadingScreen from '../components/QuizLoadingScreen';
import { useQuiz } from '../contexts/QuizContext';
import { COLORS } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { loading, error, refetchQuizzes } = useQuiz();
  
  // Show loading screen while quizzes are being fetched
  if (loading || error) {
    return <QuizLoadingScreen error={error} onRetry={refetchQuizzes} />;
  }
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          display: 'flex',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'stats-chart' : 'stats-chart-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color} 
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
