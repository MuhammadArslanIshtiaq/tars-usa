import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Platform, Share, StyleSheet, Text, TouchableOpacity } from 'react-native';

const ShareApp = ({ 
  style = {}, 
  iconSize = 24, 
  iconColor = '#1a5f3a',
  showText = false,
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
    >
      <Ionicons 
        name="share-outline" 
        size={iconSize} 
        color={iconColor} 
      />
      {showText && (
        <Text style={[styles.shareText, { color: iconColor }]}>
          Share App
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  shareText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ShareApp;
