import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { usePremiumFeature } from '@/context/PremiumFeatureContext';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { premiumEnabled } = usePremiumFeature();
  const pathname = usePathname();
  const router = useRouter();
  
  // console.log("Tab Layout Premium Status:", premiumEnabled);
  
  // Redirect if user tries to access premium screens when disabled
  useEffect(() => {
    if (!premiumEnabled) {
      if (pathname?.includes('/saved-recipes') || pathname?.includes('/pantry-list')) {
        router.replace('/home');
      }
    }
  }, [premiumEnabled, pathname, router]);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: isDark ? '#888' : '#666',
        tabBarStyle: {
          backgroundColor: isDark ? '#1A1A1A' : '#FFF',
          borderTopColor: isDark ? '#333' : '#E0E0E0',
          elevation: 0,
          shadowOpacity: 0.1,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="saved-recipes"
        options={{
          title: 'Saved Recipes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" size={size} color={color} />
          ),
          href: premiumEnabled ? undefined : null,
        }}
      />
      
      <Tabs.Screen
        name="pantry-list"
        options={{
          title: 'Pantry List',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fastfood" size={size} color={color} />
          ),
          href: premiumEnabled ? undefined : null,
        }}
      />
      
      {/* Hidden Screens */}
      <Tabs.Screen name="recipe" options={{ href: null }} />
      <Tabs.Screen name="preferences" options={{ href: null }} />
      <Tabs.Screen name="recipe/[id]" options={{ href: null }} />
    </Tabs>
  );
}