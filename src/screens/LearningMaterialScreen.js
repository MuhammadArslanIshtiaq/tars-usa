import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import ShareApp from '../components/ShareApp';
import { useUser } from '../contexts/UserContext';

const LearningMaterialScreen = ({ navigation }) => {
  const { username } = useUser();

  const learningOptions = [
    {
      id: '1',
      title: 'Road Signs',
      titleArabic: 'إشارات الطريق',
      icon: 'warning-outline',
      description: 'Learn all traffic signs and their meanings',
      color: '#e74c3c',
      onPress: () => navigation.navigate('RoadSigns')
    },
    {
      id: '2',
      title: 'Rules',
      titleArabic: 'القواعد واللوائح',
      icon: 'document-text-outline',
      description: 'Study driving rules and regulations',
      color: '#3498db',
      onPress: () => navigation.navigate('RulesContent')
    },
    {
      id: '3',
      title: 'Fines',
      titleArabic: 'الغرامات',
      icon: 'cash-outline',
      description: 'Learn about traffic fines and penalties',
      color: '#e67e22',
      onPress: () => navigation.navigate('Fines')
    },
    {
      id: '4',
      title: 'Data Sources',
      titleArabic: 'مصادر البيانات',
      icon: 'library-outline',
      description: 'Official sources and information references',
      color: '#9b59b6',
      onPress: () => navigation.navigate('DataSources')
    }
  ];

  const handleBackPress = () => {
    navigation.navigate('Main');
  };

  const renderHeaderRight = () => (
    <View style={styles.headerButtonsContainer}>
      <ShareApp 
        style={styles.shareButton}
        iconSize={28}
        iconColor="white"
        customMessage={`📚 Learning US road signs with "EASY DMV TESTS"!

Great for studying before the driving test. Check it out:`}
      />
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={handleBackPress}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Learning Material</Text>
      <Text style={styles.description}>
        Choose a category to start learning
      </Text>
    </View>
  );

  const renderOptionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={item.onPress}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={32} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>{item.title}</Text>
          <Text style={styles.optionTitleArabic}>{item.titleArabic}</Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color="#1a5f3a" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle="Learning Material"
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={learningOptions}
        renderItem={renderOptionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionTitleArabic: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LearningMaterialScreen;
