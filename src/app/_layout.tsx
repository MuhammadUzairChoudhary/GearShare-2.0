import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../providers/AppProviders';
import { FontGate } from '../components/layout/FontGate';

export default function RootLayout() {
  return (
    <AppProviders>
      <FontGate>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[listingId]" />
          <Stack.Screen name="search/index" />
          <Stack.Screen name="rental/[rentalId]" />
          <Stack.Screen name="rental/request/[listingId]" />
          <Stack.Screen name="profile/[userId]" />
          <Stack.Screen name="owner" />
          <Stack.Screen name="owner/listing/new" />
          <Stack.Screen name="owner/listing/[listingId]" />
          <Stack.Screen name="issue/[issueId]" />
        </Stack>
      </FontGate>
    </AppProviders>
  );
}
