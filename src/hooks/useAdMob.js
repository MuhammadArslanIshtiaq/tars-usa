import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import adMobService from '../config/admob';

export const useAdMob = () => {
  const [isAdReady, setIsAdReady] = useState(false);
  const isWebPlatform = Platform.OS === 'web';

  useEffect(() => {
    if (isWebPlatform) return;
    
    // Preload ad when hook is initialized
    // Note: AdMob service is initialized in App.js after ATT permission request
    const preloadAd = async () => {
      try {
        // Small delay to ensure AdMob is initialized (happens in App.js)
        await new Promise(resolve => setTimeout(resolve, 500));
        await adMobService.preloadInterstitialAd();
      } catch (error) {
        console.log('AdMob: Preload failed:', error.message);
      }
    };

    preloadAd();
    
    // Check ad status periodically
    const checkAdStatus = () => {
      try {
        const ready = adMobService.isInterstitialAdReady();
        setIsAdReady(ready);
      } catch (error) {
        console.log('AdMob: Status check failed:', error.message);
      }
    };

    const interval = setInterval(checkAdStatus, 3000); // Check every 3 seconds
    checkAdStatus();

    return () => {
      clearInterval(interval);
    };
  }, [isWebPlatform]);

  const showAd = useCallback(async () => {
    if (isWebPlatform) return false;

    try {
      const shown = await adMobService.showInterstitialAd();
      if (shown) {
        setIsAdReady(false);
      }
      return shown;
    } catch (error) {
      console.log('AdMob: Show ad failed:', error.message);
      return false;
    }
  }, [isWebPlatform]);

  const loadAd = useCallback(async () => {
    if (isWebPlatform) {
      return;
    }

    try {
      await adMobService.loadInterstitialAd();
      const ready = adMobService.isInterstitialAdReady();
      setIsAdReady(ready);
    } catch (error) {
      console.log('AdMob: Load ad failed:', error.message);
    }
  }, [isWebPlatform]);

  const showRewardedAd = useCallback(async () => {
    if (isWebPlatform) return false;

    try {
      const shown = await adMobService.showRewardedAd();
      return shown;
    } catch (error) {
      console.log('AdMob: Show rewarded ad failed:', error.message);
      return false;
    }
  }, [isWebPlatform]);

  return {
    isAdReady: isWebPlatform ? false : isAdReady,
    showAd,
    loadAd,
    showRewardedAd,
  };
};
