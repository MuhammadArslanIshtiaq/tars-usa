import Constants from 'expo-constants';
import { Platform } from 'react-native';

// AdMob service - Android & iOS, Interstitial ads only
// - Android: Real AdMob interstitial ads
// - iOS: Real AdMob interstitial ads
// - Web: No ads (disabled for stability)
// - Expo Go: No ads (native module not available; use dev build for testing ads)

const isExpoGo = Constants.appOwnership === 'expo';

class AdMobService {
  constructor() {
    this.isAndroid = Platform.OS === 'android';
    this.isIOS = Platform.OS === 'ios';
    this.isWebPlatform = Platform.OS === 'web';
    this.isAdLoaded = false;
    this.isAdLoading = false;
    this.interstitial = null;
    this._unsubscribeLoaded = null;
    this._unsubscribeClosed = null;
    this._closeWaiters = [];
    this.sdkInitialized = false;

    // Get AdMob IDs from environment variables or app.json
    const admob = Constants.expoConfig?.extra?.admob || {};
    this.ids = {
      appId: this.isAndroid 
        ? (process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || admob.android?.appId)
        : (process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || admob.ios?.appId),
      interstitialUnitId: this.isAndroid 
        ? (process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_UNIT_ID || admob.android?.interstitialUnitId)
        : (process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_UNIT_ID || admob.ios?.interstitialUnitId),
    };

    // Skip loading native module on web or in Expo Go (native module not included in Expo Go)
    this.googleMobileAds = null;
    if (!this.isWebPlatform && !isExpoGo) {
      try {
        // eslint-disable-next-line global-require
        this.googleMobileAds = require('react-native-google-mobile-ads');
        console.log('AdMob: Google Mobile Ads SDK loaded successfully');
        this.sdkInitialized = true;
      } catch (e) {
        console.log('AdMob: Failed to load Google Mobile Ads SDK:', e.message);
        this.sdkInitialized = false;
      }
    } else if (isExpoGo) {
      console.log('AdMob: Expo Go detected - ads disabled (use a development build to test ads)');
    }

    console.log(`AdMob: Service initialized for ${Platform.OS} platform`);
    if (!this.isWebPlatform && !isExpoGo) {
      console.log('AdMob: App ID:', this.ids.appId);
      console.log('AdMob: Interstitial Unit ID:', this.ids.interstitialUnitId);
      console.log('AdMob: SDK Initialized:', this.sdkInitialized);
    } else if (this.isWebPlatform) {
      console.log('AdMob: Web platform - ads disabled');
    }
  }

  async initialize() {
    try {
      if (this.isWebPlatform || isExpoGo) {
        if (isExpoGo) {
          console.log('AdMob: Expo Go - ads disabled');
        } else {
          console.log('AdMob: Web platform - ads disabled');
        }
        return;
      }

      if (!this.sdkInitialized || !this.googleMobileAds) {
        console.log('AdMob: SDK not available - ads disabled (use a development build to test ads)');
        return;
      }

      console.log('AdMob: Initializing Google Mobile Ads SDK...');
      await this.googleMobileAds.default().initialize();
      console.log('AdMob: Google Mobile Ads SDK initialized successfully');

      // Preload interstitial ad on startup
      await this.preloadInterstitialAd();
    } catch (error) {
      this.sdkInitialized = false;
      this.googleMobileAds = null;
      console.log('AdMob: Initialization failed - ads disabled:', error?.message || String(error));
      console.log('AdMob: Use a development build (expo run:ios/android) or production build for ads.');
    }
  }

  _cleanupListeners() {
    try { if (this._unsubscribeLoaded) this._unsubscribeLoaded(); } catch {}
    try { if (this._unsubscribeClosed) this._unsubscribeClosed(); } catch {}
    this._unsubscribeLoaded = null;
    this._unsubscribeClosed = null;
  }

  async preloadInterstitialAd() {
    if (this.isAdLoading || this.isAdLoaded) return;

    // Web platform - no ads
    if (this.isWebPlatform) {
      console.log('AdMob: Web platform - interstitial ads disabled');
      return;
    }

    // Check if SDK is available
    if (!this.sdkInitialized || !this.googleMobileAds) {
      console.log('AdMob: SDK not available - interstitial ads disabled');
      console.log('AdMob: This is normal in development mode. Ads will work in production builds.');
      return;
    }

    // Real AdMob interstitials for mobile platforms
    try {
      const { InterstitialAd, AdEventType } = this.googleMobileAds;
      console.log('AdMob: Preloading real interstitial ad...');
      this.isAdLoading = true;
      this.isAdLoaded = false;

      this._cleanupListeners();
      this.interstitial = InterstitialAd.createForAdRequest(this.ids.interstitialUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      this._unsubscribeLoaded = this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isAdLoaded = true;
        this.isAdLoading = false;
        console.log('AdMob: Real interstitial ad loaded successfully');
      });

      this._unsubscribeClosed = this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('AdMob: Interstitial ad closed');
        this.isAdLoaded = false;
        const waiters = this._closeWaiters.splice(0, this._closeWaiters.length);
        waiters.forEach((fn) => {
          try { fn(); } catch {}
        });
        // Preload next ad after a short delay
        setTimeout(() => this.preloadInterstitialAd(), 1000);
      });

      // Start loading the real ad
      this.interstitial.load();
    } catch (error) {
      console.log('AdMob: Failed to preload interstitial ad:', error?.message || String(error));
      this.isAdLoaded = false;
      this.isAdLoading = false;
    }
  }

  async loadInterstitialAd() {
    return this.preloadInterstitialAd();
  }

  isInterstitialAdReady() {
    return !!this.isAdLoaded;
  }

  async showInterstitialAd() {
    try {
      if (!this.isAdLoaded) {
        console.log('AdMob: Ad not ready, loading now...');
        await this.preloadInterstitialAd();
      }

      if (!this.isAdLoaded) {
        console.log('AdMob: No ad available to show');
        return false;
      }

      // Show real AdMob interstitial
      if (!this.isWebPlatform && this.googleMobileAds && this.interstitial) {
        console.log('AdMob: Showing real interstitial ad...');
        await this.interstitial.show();
        return true;
      }

      // Web platform - no ads
      if (this.isWebPlatform) {
        console.log('AdMob: Web platform - interstitial ads disabled');
        return false;
      }

      // Fallback if SDK not available
      console.log('AdMob: Google Mobile Ads SDK not available - cannot show interstitial');
      return false;
    } catch (error) {
      console.log('AdMob: Failed to show interstitial ad:', error?.message || String(error));
      return false;
    }
  }

  async showInterstitialAdAndWaitForClose({ timeoutMs = 8000 } = {}) {
    const shown = await this.showInterstitialAd();
    if (!shown) return false;

    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };

      const t = setTimeout(finish, timeoutMs);
      this._closeWaiters.push(() => {
        clearTimeout(t);
        finish();
      });
    });

    return true;
  }

  // Not used but kept to satisfy existing hook API
  async showRewardedAd() { return false; }

  // Banner ads removed to avoid build conflicts
  getBannerAd() {
    console.log('AdMob: Banner ads disabled to avoid build conflicts');
    return null;
  }

  destroy() {
    this._cleanupListeners();
    this.isAdLoaded = false;
    this.isAdLoading = false;
    this.interstitial = null;
    console.log('AdMob: Service destroyed');
  }
}

const adMobService = new AdMobService();
// NOTE: initialize() is called explicitly in App.js AFTER App Tracking Transparency permission is requested
// This ensures compliance with Apple's ATT requirements

export default adMobService;