import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import ShareApp from '../components/ShareApp';
import { useUser } from '../contexts/UserContext';

const ProfileScreen = ({ navigation }) => {
  const { username, userStats, updateUsername, clearHistory } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const handleEditUsername = () => {
    setNewUsername(username);
    setShowEditModal(true);
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Please enter a valid username.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateUsername(newUsername.trim());
      Alert.alert('Success', 'Username updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update username. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearHistory = () => {
    setShowClearModal(true);
  };

  const confirmClearHistory = async () => {
    setIsUpdating(true);
    try {
      await clearHistory();
      Alert.alert('Success', 'Quiz history has been cleared.');
      setShowClearModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear history. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Username</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter new username"
            value={newUsername}
            onChangeText={setNewUsername}
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveUsername}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderClearModal = () => (
    <Modal
      visible={showClearModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowClearModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={48} color="#e74c3c" />
            <Text style={styles.clearModalTitle}>Clear History</Text>
          </View>
          
          <Text style={styles.clearWarningText}>
            This action cannot be undone. All your quiz history and statistics will be permanently deleted.
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowClearModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={confirmClearHistory}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Clear History</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderHeaderRight = () => (
    <TouchableOpacity 
      style={styles.headerButton}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="arrow-back" size={28} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle="Profile"
      >
        {renderHeaderRight()}
      </Header>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#1a5f3a" />
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.name}>{username || 'Guest User'}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditUsername}
                >
                  <Ionicons name="pencil" size={18} color="#1a5f3a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Your Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.quizzesTaken}</Text>
                <Text style={styles.statLabel}>Quizzes Taken</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.averageScore.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('QuizHistory')}
            >
              <Ionicons name="time-outline" size={24} color="#1a5f3a" />
              <Text style={styles.actionButtonText}>Quiz History</Text>
              <Ionicons name="chevron-forward" size={20} color="#1a5f3a" />
            </TouchableOpacity>

            <ShareApp 
              style={styles.shareActionButton}
              iconSize={24}
              iconColor="#1a5f3a"
              showText={true}
              customMessage={`🚗 I'm practicing for my US DMV test with "EASY DMV TESTS"! 

Perfect for road signs, rules, and mock tests. Check it out:`}
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearHistory}
            >
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
              <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>Clear History</Text>
              <Ionicons name="chevron-forward" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {renderEditModal()}
      {renderClearModal()}
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
  
  // Profile Card
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1a5f3a',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },

  // Stats Card
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5f3a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Actions Card
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  shareActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 2,
    backgroundColor: 'rgba(241, 154, 92, 0.1)',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#1a5f3a',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Clear Modal Styles
  warningHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clearModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 12,
    textAlign: 'center',
  },
  clearWarningText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
});

export default ProfileScreen;
