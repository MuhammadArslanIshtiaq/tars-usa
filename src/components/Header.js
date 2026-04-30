import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, GRADIENTS } from '../theme/colors';

const Header = ({ username, navigation, children, customGreeting, customSubtitle, pageTitle }) => {
  const displayName = username || 'Guest';
  
  // Use custom text if provided, otherwise use default
  const greeting = customGreeting
    ? (username ? `${customGreeting} ${displayName}` : customGreeting)
    : 'EASY DMV TESTS';
  const subtitle = pageTitle || customSubtitle || 'Ready for today\'s quiz?';
  
  return (
    <LinearGradient
      colors={GRADIENTS.header}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children && (
          <View style={styles.rightContainer}>
            {children}
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.92)',
  },
  rightContainer: {
    marginLeft: 16,
  },
});

export default Header; 