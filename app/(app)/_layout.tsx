import { Tabs } from 'expo-router/tabs';
import React, { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { logAnalyticsEvent } from '@/services/analyticsService';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Track app initialization
  useEffect(() => {
    logAnalyticsEvent('app_initialized', {
      color_scheme: colorScheme,
      timestamp: new Date().toISOString()
    });
  }, []);

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
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved-recipes"
        options={{
          title: 'Saved Recipes',
          tabBarIcon: ({ color }) => <MaterialIcons name="bookmark" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipe"
        options={{
          title: 'Recipe',
          tabBarIcon: ({ color }) => <MaterialIcons name="restaurant" size={24} color={color} />,
          href: null, // Hide this tab, it's for viewing recipe details
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: 'Preferences',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipe/[id]"
        options={{
          href: null, // Hide this screen from the tab bar
        }}
      />
      <Tabs.Screen
        name="debug"
        options={{
          title: 'Debug',
          tabBarIcon: ({ color }) => <MaterialIcons name="bug-report" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 