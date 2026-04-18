import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTracking } from '../contexts/TrackingContext';
import { COLORS, GRADIENTS } from '../theme/colors';

const WelcomeScreen = ({ navigation }) => {
  const { requestTrackingAndProceed } = useTracking();
  const [isProceeding, setIsProceeding] = useState(false);

  const handleGetStarted = async () => {
    if (isProceeding) return;
    setIsProceeding(true);
    try {
      await requestTrackingAndProceed();
      navigation.replace('Setup');
    } catch (error) {
      navigation.replace('Setup');
    } finally {
      setIsProceeding(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <LinearGradient
        colors={GRADIENTS.header}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>EASY DMV TESTS</Text>
          <Text style={styles.subtitle}>
            Practice for your US DMV permit test with road signs, rules, and realistic quizzes.
          </Text>
         

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.featureText}>Comprehensive mock tests</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.featureText}>Sign recognition quizzes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.featureText}>Multi-language support</Text>
            </View>
          </View>

          {Platform.OS === 'ios' && (
            <Text style={styles.attNote}>
              On the next step you may see a permission request for personalized ads. You can allow or decline.
            </Text>
          )}

          <TouchableOpacity 
            style={[styles.continueButton, isProceeding && styles.continueButtonDisabled]}
            onPress={handleGetStarted}
            disabled={isProceeding}
            accessibilityLabel="Get Started"
            accessibilityRole="button"
          >
            {isProceeding ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
              </>
            )}
          </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    minHeight: '100%',
  },
  iconContainer: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 35,
    paddingHorizontal: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    fontWeight: '500',
  },
  attNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    gap: 10,
  },
  continueButtonDisabled: {
    opacity: 0.8,
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default WelcomeScreen; 