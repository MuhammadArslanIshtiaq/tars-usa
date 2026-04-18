import React, { createContext, useCallback, useContext } from 'react';
import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

export const TrackingContext = createContext(null);

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

export const TrackingProvider = ({ children, initializeAdmob }) => {
  const requestTrackingAndProceed = useCallback(async () => {
    if (Platform.OS === 'ios') {
      try {
        const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
        if (status === 'undetermined') {
          await TrackingTransparency.requestTrackingPermissionsAsync();
        }
      } catch (error) {
        console.warn('ATT: Error requesting tracking permission', error?.message);
      }
    }
    await initializeAdmob();
  }, [initializeAdmob]);

  return (
    <TrackingContext.Provider value={{ requestTrackingAndProceed }}>
      {children}
    </TrackingContext.Provider>
  );
};
