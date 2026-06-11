import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdTriggerFallbackProvider } from './src/contexts/AdTriggerFallbackContext';
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
import LearningMaterialScreen from './src/screens/LearningMaterialScreen';
import RoadSignsScreen from './src/screens/RoadSignsScreen';
import RulesContentScreen from './src/screens/RulesContentScreen';
import TipsScreen from './src/screens/TipsScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

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
  const [appIsReady, setAppIsReady] = useState(false);
  const stableInitializeAdmob = useCallback(initializeAdmob, []);
  const handleAppReady = useCallback(() => {
    setAppIsReady(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      initializeAdmob();
    }
  }, []);

  useEffect(() => {
    if (!appIsReady) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [appIsReady]);

  return (
    <SafeAreaProvider>
      <UserProvider onReady={handleAppReady}>
        <QuizProvider>
          <AdTriggerFallbackProvider>
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
                  <Stack.Screen name="DataSources" component={DataSourcesScreen} />
                  <Stack.Screen name="Tips" component={TipsScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </TrackingProvider>
          </AdTriggerFallbackProvider>
        </QuizProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
