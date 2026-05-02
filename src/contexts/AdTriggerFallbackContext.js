import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { resolveAdTriggerOutcome } from '../utils/sessionInterstitialGate';

const AdTriggerFallbackContext = createContext(null);

const APP_STORE_URL =
  'https://apps.apple.com/us/app/traffic-road-sign-tests-uae/id6753111808';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.trafficandroadsigns.app';

const buildShareMessage = () => {
  const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
  return `🚗 Check out "EASY DMV TESTS" — a simple way to practice US road signs and driving theory!

📱 Download now: ${storeUrl}

Perfect for:
✅ US DMV permit test practice
✅ Road signs practice
✅ Mock driving tests
✅ Learning traffic rules

#DMVTest #RoadSigns #DrivingTest #RoadSafety`;
};

export const AdTriggerFallbackProvider = ({ children }) => {
  const [shareVisible, setShareVisible] = useState(false);
  const shareDoneRef = useRef(null);

  const finishShareModal = useCallback(() => {
    setShareVisible(false);
    const resolve = shareDoneRef.current;
    shareDoneRef.current = null;
    resolve?.();
  }, []);

  const handleShareAppPress = useCallback(async () => {
    try {
      const message = buildShareMessage();
      const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
      await Share.share({
        message: Platform.OS === 'android' ? `${message}` : message,
        url: Platform.OS === 'ios' ? storeUrl : undefined,
      });
    } catch {
      // ignore
    } finally {
      finishShareModal();
    }
  }, [finishShareModal]);

  const waitForShareModal = useCallback(() => {
    return new Promise((resolve) => {
      shareDoneRef.current = resolve;
      setShareVisible(true);
    });
  }, []);

  const presentAdTrigger = useCallback(
    async (showAdAndWaitForClose, opts = {}) => {
      const outcome = await resolveAdTriggerOutcome(showAdAndWaitForClose, opts);
      if (outcome === 'share_modal') {
        await waitForShareModal();
      }
      return outcome;
    },
    [waitForShareModal]
  );

  const value = useMemo(() => ({ presentAdTrigger }), [presentAdTrigger]);

  return (
    <AdTriggerFallbackContext.Provider value={value}>
      {children}

      <Modal
        visible={shareVisible}
        transparent
        animationType="fade"
        onRequestClose={finishShareModal}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="share-social-outline" size={36} color="#2563eb" />
            </View>
            <Text style={styles.title}>Share the app</Text>
            <Text style={styles.body}>
              Help friends study for their permit test — share Easy DMV Tests with a tap.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleShareAppPress}
              accessibilityRole="button"
              accessibilityLabel="Share app"
            >
              <Ionicons name="share-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Share app</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={finishShareModal}
              accessibilityRole="button"
              accessibilityLabel="Not now"
            >
              <Text style={styles.secondaryButtonText}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AdTriggerFallbackContext.Provider>
  );
};

export const useAdTriggerFallback = () => {
  const ctx = useContext(AdTriggerFallbackContext);
  if (!ctx) {
    throw new Error('useAdTriggerFallback must be used within AdTriggerFallbackProvider');
  }
  return ctx;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
