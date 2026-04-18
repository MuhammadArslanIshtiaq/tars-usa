import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { useUser } from '../contexts/UserContext';

const FinesScreen = ({ navigation }) => {
  const { username } = useUser();

  // Fines images data
  const finesImages = [
    {
      id: '1',
      image: require('../../assets/images/fines/fines.png')
    }
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderHeaderRight = () => (
    <TouchableOpacity 
      style={styles.headerButton}
      onPress={handleBackPress}
    >
      <Ionicons name="arrow-back" size={28} color="white" />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Traffic Fines</Text>
    </View>
  );

  const renderFinesItem = ({ item }) => (
    <View style={styles.finesCard}>
      <Image 
        source={item.image} 
        style={styles.finesImage}
        resizeMode="contain"
      />
    </View>
  );

  const renderFooter = () => (
    <View style={styles.notesContainer}>
      <Text style={styles.notesTitle}>Notes on Points System</Text>
      
      <View style={styles.noteItem}>
        <View style={styles.bulletPoint} />
        <View style={styles.noteTextContainer}>
          <Text style={styles.noteLabel}>License Suspension:</Text>
          <Text style={styles.noteText}>
            The driver's license will be suspended or stopped temporarily for a particular period when their accumulated points record reaches 24 points.
          </Text>
        </View>
      </View>

      <View style={styles.noteItem}>
        <View style={styles.bulletPoint} />
        <View style={styles.noteTextContainer}>
          <Text style={styles.noteLabel}>Points Deletion:</Text>
          <Text style={styles.noteText}>
            Points are deleted from the driver's log after passing one year without committing new traffic violations.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle="Traffic Fines"
      >
        {renderHeaderRight()}
      </Header>
      <FlatList
        data={finesImages}
        renderItem={renderFinesItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={renderFooter}
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  finesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    padding: 10,
    alignItems: 'center',
  },
  finesImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a5f3a',
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a5f3a',
    marginTop: 6,
    marginRight: 12,
  },
  noteTextContainer: {
    flex: 1,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
});

export default FinesScreen;
