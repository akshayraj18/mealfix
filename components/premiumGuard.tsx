import React, { useEffect, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePremiumFeature } from '@/context/PremiumFeatureContext';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumGuard({ children }: { children: ReactNode }) {
  const { premiumEnabled } = usePremiumFeature();

  useEffect(() => {
    if (!premiumEnabled) {
      // Redirect after a short delay to allow the UI to show
      const timeout = setTimeout(() => {
        router.replace('/home');
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [premiumEnabled]);

  if (!premiumEnabled) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="lock" size={80} color="#FF6B6B" />
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.message}>
          This feature requires premium access. You'll be redirected to the home screen.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/home')}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8B8B']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#FF6B6B',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});