import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QuizProvider } from './src/contexts/QuizContext';
import { UserProvider } from './src/contexts/UserContext';
import { TrackingProvider } from './src/contexts/TrackingContext';
import TabNavigator from './src/navigation/TabNavigator';

import ProfileScreen from './src/screens/ProfileScreen';
import Quiz from './src/screens/Quiz';
import QuizHistoryScreen from './src/screens/QuizHistoryScreen';
import SetupScreen from './src/screens/SetupScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import DataSourcesScreen from './src/screens/DataSourcesScreen';
import FinesScreen from './src/screens/FinesScreen';
import LearningMaterialScreen from './src/screens/LearningMaterialScreen';
import RoadSignsScreen from './src/screens/RoadSignsScreen';
import RulesContentScreen from './src/screens/RulesContentScreen';
import TipsScreen from './src/screens/TipsScreen';

let admobInitialized = false;

const initializeAdmob = async () => {
  if (admobInitialized) return;
  try {
    const admobModule = await import('./src/config/admob');
    const adMobService = admobModule.default;
    await adMobService.initialize();
    admobInitialized = true;
  } catch (error) {
    console.warn('AdMob: Failed to initialize', error?.message);
  }
};

const Stack = createNativeStackNavigator();

export default function App() {
  const stableInitializeAdmob = useCallback(initializeAdmob, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      initializeAdmob();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <QuizProvider>
          <TrackingProvider initializeAdmob={stableInitializeAdmob}>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{ headerShown: false, animation: 'none' }}
              >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Setup" component={SetupScreen} />
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="Quiz" component={Quiz} />
                <Stack.Screen name="QuizHistory" component={QuizHistoryScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="LearningMaterial" component={LearningMaterialScreen} />
                <Stack.Screen name="RoadSigns" component={RoadSignsScreen} />
                <Stack.Screen name="RulesContent" component={RulesContentScreen} />
                <Stack.Screen name="Fines" component={FinesScreen} />
                <Stack.Screen name="DataSources" component={DataSourcesScreen} />
                <Stack.Screen name="Tips" component={TipsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </TrackingProvider>
        </QuizProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
