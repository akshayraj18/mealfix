import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
        }}
      />
      <Tabs.Screen
        name="recipe"
        options={{
          href: null, // Hide this screen from the tab bar
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          href: null, // Hide this screen from the tab bar
        }}
      />
      <Tabs.Screen
        name="recipe/[id]"
        options={{
          href: null, // Hide this screen from the tab bar
        }}
      />
    </Tabs>
  );
} 