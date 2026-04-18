import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';

const DataSourcesScreen = ({ navigation }) => {
  const { username } = useUser();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderHeaderRight = () => (
    <TouchableOpacity 
      style={styles.headerButton}
      onPress={handleBackPress}
    >
      <Ionicons name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a5f3a" />
      <Header
        customGreeting="Data Sources"
        customSubtitle="Official websites and information sources"
        pageTitle="Data Sources"
      >
        {renderHeaderRight()}
      </Header>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* App Disclaimer */}
          <View style={styles.disclaimerSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#1a5f3a" />
              <Text style={styles.sectionTitle}>Important Disclaimer</Text>
            </View>
            <Text style={styles.disclaimerText}>
              This app is <Text style={styles.boldText}>NOT affiliated with or endorsed by any official authority</Text>. 
              We provide traffic fines and road sign information for educational and reference purposes only.
            </Text>
            <Text style={styles.disclaimerText}>
              While we strive to keep this information accurate and up-to-date, please verify current information 
              directly with the relevant official authority before making any decisions.
            </Text>
            <Text style={styles.disclaimerText}>
              <Text style={styles.boldText}>For official and most current information, always refer to the official sources.</Text>
            </Text>
          </View>


        

          {/* Data Update Information */}
          <View style={styles.updateSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="refresh-circle" size={24} color="#1a5f3a" />
              <Text style={styles.sectionTitle}>Data Updates</Text>
            </View>
            <Text style={styles.updateText}>
              Our app automatically checks for updates to official information every 6 months. 
              However, official policies and fees may change more frequently.
            </Text>
            <Text style={styles.updateText}>
              <Text style={styles.boldText}>Last app update:</Text> {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="mail" size={24} color="#1a5f3a" />
              <Text style={styles.sectionTitle}>Report Issues</Text>
            </View>
            <Text style={styles.contactText}>
              If you find any outdated or incorrect information in our app, please contact us immediately 
              so we can update it for all users.
            </Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => Linking.openURL('mailto:imad@remoterun.uk?subject=USA%20DMV%20Tests%20App%20Support')}
            >
              <Ionicons name="mail-outline" size={20} color="white" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Notice */}
          <View style={styles.legalSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color="#1a5f3a" />
              <Text style={styles.sectionTitle}>Legal Notice</Text>
            </View>
            <Text style={styles.legalText}>
              This app is developed by independent developers and is not an official application. 
              All information is sourced from publicly available official sources and is provided 
              for educational purposes only.
            </Text>
            <Text style={styles.legalText}>
              Users are responsible for verifying all information with official sources before 
              making any decisions related to driving licenses, traffic fines, or other official services.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a5f3a',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '600',
    color: '#1a5f3a',
  },
  updateSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  updateText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  contactSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#45B7D1',
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a5f3a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  legalSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F093FB',
  },
  legalText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  officialLinkSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1a5f3a',
  },
  officialLinkText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  officialLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a5f3a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a5f3a',
  },
  linkInfo: {
    flex: 1,
  },
  linkName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default DataSourcesScreen;

