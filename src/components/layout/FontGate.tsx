import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAppFonts } from '../../hooks/useFonts';

interface FontGateProps {
  children: React.ReactNode;
}

export function FontGate({ children }: FontGateProps) {
  const { fontsLoaded, fontsError } = useAppFonts();

  if (fontsError) {
    // Fonts failed to load but we can still render with system fonts
    console.warn('[FontGate] Font loading error:', fontsError);
    return <>{children}</>;
  }

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0D0E',
        }}
      >
        <ActivityIndicator size="large" color="#C8FF3D" />
      </View>
    );
  }

  return <>{children}</>;
}
