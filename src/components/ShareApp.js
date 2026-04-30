import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Platform, Share, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

const ShareApp = ({ 
  style = {}, 
  iconSize = 24, 
  iconColor = COLORS.primary2,
  showText = false,
  textColor = COLORS.text,
  showChevron = false,
  chevronColor = COLORS.primary2,
  customMessage = null 
}) => {
  const shareApp = async () => {
    try {
      const appStoreUrl = Platform.OS === 'ios' 
        ? 'https://apps.apple.com/us/app/traffic-road-sign-tests-uae/id6753111808'
        : 'https://play.google.com/store/apps/details?id=com.trafficandroadsigns.app';
        
      
      const message = customMessage || `🚗 Check out "EASY DMV TESTS" — a simple way to practice US road signs and driving theory!

📱 Download now: ${appStoreUrl}

Perfect for:
✅ US DMV permit test practice
✅ Road signs practice
✅ Mock driving tests
✅ Learning traffic rules

#DMVTest #RoadSigns #DrivingTest #RoadSafety`;

      const shareOptions = {
        message: message,
        url: Platform.OS === 'ios' ? appStoreUrl : undefined, // iOS handles URL separately
      };

      // Use native Share API (available on both platforms)
      if (Platform.OS === 'android') {
        shareOptions.message = `${message}`;
      }

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('App shared successfully');
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert(
        'Share Error',
        'Unable to share the app at this moment. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.shareButton, style]} 
      onPress={shareApp}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Share app"
    >
      <Ionicons 
        name="share-outline" 
        size={iconSize} 
        color={iconColor} 
      />
      {showText && (
        <Text style={[styles.shareText, { color: textColor }]}>
          Share App
        </Text>
      )}
      {showChevron ? <Ionicons name="chevron-forward" size={20} color={chevronColor} /> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shareText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ShareApp;
