import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { trackScreenView, logAnalyticsEvent } from '@/services/analyticsService';

interface AnalyticsHookOptions {
  screenName: string;
  trackAppState?: boolean;
  trackFirstRender?: boolean;
}

/**
 * Custom hook for tracking screen time and user interactions
 * 
 * @param options Configuration options for analytics tracking
 * @returns Analytics utility functions
 */
export function useAnalytics(options: AnalyticsHookOptions) {
  const { screenName, trackAppState = true, trackFirstRender = true } = options;
  
  // Refs to track time spent on screen
  const enteredTimestamp = useRef<number>(Date.now());
  const cumulativeTimeRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundEnteredTime = useRef<number | null>(null);
  
  // State to track user interactions on the screen
  const [interactionCount, setInteractionCount] = useState(0);
  
  useEffect(() => {
    // Track screen entry
    enteredTimestamp.current = Date.now();
    
    // Log screen entry event
    logAnalyticsEvent('screen_enter', {
      screen_name: screenName,
      timestamp: new Date().toISOString()
    });
    
    // Track app state changes if needed
    let appStateSubscription: any;
    
    if (trackAppState) {
      appStateSubscription = AppState.addEventListener('change', nextAppState => {
        // App is going to the background
        if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
          // Record time spent on screen before going to background
          const currentTime = Date.now();
          const timeSpent = currentTime - enteredTimestamp.current;
          cumulativeTimeRef.current += timeSpent;
          backgroundEnteredTime.current = currentTime;
          
          // Log app background event
          logAnalyticsEvent('app_background', {
            screen_name: screenName,
            time_spent_ms: timeSpent
          });
        }
        
        // App is coming to the foreground
        if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
          // Reset the entry timestamp
          enteredTimestamp.current = Date.now();
          
          // Log app foreground event
          logAnalyticsEvent('app_foreground', {
            screen_name: screenName,
            background_time_ms: backgroundEnteredTime.current ? Date.now() - backgroundEnteredTime.current : 0
          });
        }
        
        appStateRef.current = nextAppState;
      });
    }
    
    // Track initial render if needed
    if (trackFirstRender) {
      const renderTime = performance.now();
      // Use setTimeout to ensure this runs after render is complete
      setTimeout(() => {
        const timeToRender = Math.round(performance.now() - renderTime);
        logAnalyticsEvent('screen_render', {
          screen_name: screenName,
          render_time_ms: timeToRender
        });
      }, 0);
    }
    
    // Clean up and track screen exit
    return () => {
      // Calculate time spent on this screen
      const exitTime = Date.now();
      let timeSpentMs = cumulativeTimeRef.current;
      
      // Add time since last background state change or initial entry
      if (appStateRef.current === 'active') {
        timeSpentMs += exitTime - enteredTimestamp.current;
      }
      
      // Log screen view event with time spent
      trackScreenView(screenName, timeSpentMs);
      
      // Unsubscribe from app state changes
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
    };
  }, [screenName, trackAppState, trackFirstRender]);
  
  /**
   * Track a user interaction on the screen
   * @param interactionType The type of interaction (e.g., button_press, swipe)
   * @param metadata Additional data about the interaction
   */
  const trackInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    setInteractionCount(prev => prev + 1);
    logAnalyticsEvent('user_interaction', {
      screen_name: screenName,
      interaction_type: interactionType,
      interaction_count: interactionCount + 1,
      ...metadata
    });
  };
  
  /**
   * Track a feature usage on the screen
   * @param featureName The name of the feature being used
   * @param metadata Additional data about the feature usage
   */
  const trackFeatureUsage = (featureName: string, metadata?: Record<string, any>) => {
    logAnalyticsEvent('feature_usage', {
      screen_name: screenName,
      feature_name: featureName,
      ...metadata
    });
  };
  
  return {
    trackInteraction,
    trackFeatureUsage,
    interactionCount
  };
} 