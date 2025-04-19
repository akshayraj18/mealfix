import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PremiumFeatureContextType = {
  premiumEnabled: boolean;
  setPremiumEnabled: (enabled: boolean) => void;
};

const PremiumFeatureContext = createContext<PremiumFeatureContextType | undefined>(undefined);

export const PremiumFeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [premiumEnabled, setPremiumEnabledState] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load the saved premium status on mount
  useEffect(() => {
    const loadSavedStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem('premiumFeatureEnabled');
        if (savedStatus !== null) {
          setPremiumEnabledState(JSON.parse(savedStatus));
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load premium status:', error);
        setIsInitialized(true);
      }
    };
    
    loadSavedStatus();
  }, []);
  
  // Function to update the premium status and save it
  const setPremiumEnabled = async (status: boolean) => {
    //console.log("Setting premium status to:", status);
    setPremiumEnabledState(status);
    try {
      await AsyncStorage.setItem('premiumFeatureEnabled', JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save premium status:', error);
    }
  };
  
  // Don't render children until the initial state is loaded
  if (!isInitialized) {
    return null; // Or a loading spinner
  }
  
  return (
    <PremiumFeatureContext.Provider value={{ premiumEnabled, setPremiumEnabled }}>
      {children}
    </PremiumFeatureContext.Provider>
  );
};

export const usePremiumFeature = () => {
  const context = useContext(PremiumFeatureContext);
  if (!context) {
    throw new Error('usePremiumFeature must be used within PremiumFeatureProvider');
  }
  return context;
};