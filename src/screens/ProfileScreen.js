import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import ShareApp from '../components/ShareApp';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors';

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        username={username} 
        navigation={navigation}
        pageTitle="Profile"
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={COLORS.primary2} />
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.name}>{username || 'Guest User'}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditUsername}
                  accessibilityRole="button"
                  accessibilityLabel="Edit username"
                >
                  <Ionicons name="pencil" size={18} color={COLORS.primary2} />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>Your stats and settings in one place</Text>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Your Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Ionicons name="reader-outline" size={18} color={COLORS.primary2} />
                </View>
                <Text style={styles.statNumber}>{userStats.quizzesTaken}</Text>
                <Text style={styles.statLabel}>Quizzes Taken</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Ionicons name="sparkles-outline" size={18} color={COLORS.accent} />
                </View>
                <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Ionicons name="speedometer-outline" size={18} color={COLORS.primary2} />
                </View>
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
              accessibilityRole="button"
              accessibilityLabel="Open quiz history"
            >
              <Ionicons name="time-outline" size={24} color={COLORS.primary2} />
              <Text style={styles.actionButtonText}>Quiz History</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearHistory}
              accessibilityRole="button"
              accessibilityLabel="Clear quiz history"
            >
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
              <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>Clear History</Text>
              <Ionicons name="chevron-forward" size={20} color="#e74c3c" />
            </TouchableOpacity>

            <ShareApp
              style={styles.actionButton}
              iconSize={24}
              iconColor={COLORS.primary2}
              textColor={COLORS.text}
              showText={true}
              showChevron={true}
              chevronColor={COLORS.primary2}
              customMessage={`🚗 I'm practicing for my US DMV test with "EASY DMV TESTS"! 

Perfect for road signs, rules, and mock tests. Check it out:`}
            />
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
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  // Profile Card
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
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
    borderColor: COLORS.primary2,
    backgroundColor: '#EFF6FF',
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
    color: COLORS.text,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },

  // Stats Card
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
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
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Actions Card
  actionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 4,
    elevation: 3,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    color: COLORS.text,
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
    backgroundColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: COLORS.primary2,
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
