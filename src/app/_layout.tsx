import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../providers/AppProviders';
import { FontGate } from '../components/layout/FontGate';
import { useTheme } from '../theme/ThemeContext';

// The navigator is a separate component so it renders *inside* AppProviders:
// useTheme() requires ThemeProvider, which is mounted by AppProviders.
function RootNavigator() {
  const { colors } = useTheme();

  return (
    <FontGate>
      <StatusBar style="light" />
      {/*
        Alpine stack transitions:
        - Short horizontal directional movement (slide_from_right, 200 ms on iOS)
        - Android uses the platform's native slide; hardware back is preserved
        - Native iOS back gesture stays enabled (gestureEnabled)
      */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
          gestureEnabled: true,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[listingId]" />
        <Stack.Screen name="search/index" />
        <Stack.Screen name="rental/[rentalId]" />          <Stack.Screen name="rental/request/[listingId]" />
          <Stack.Screen name="chat/[rentalId]" />
          <Stack.Screen name="profile/[userId]" />
        <Stack.Screen name="owner" />
        <Stack.Screen name="owner/listing/new" />
        <Stack.Screen name="owner/listing/[listingId]" />
        <Stack.Screen name="issue/[issueId]" />
      </Stack>
    </FontGate>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
