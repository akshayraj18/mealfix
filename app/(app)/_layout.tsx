import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="home" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="recipe" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 