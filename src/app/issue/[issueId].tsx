import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { BackButton } from '../../components/ui/BackButton';
import { EmptyState } from '../../components/feedback/EmptyState';

export default function IssueDetailScreen() {
  const { issueId } = useLocalSearchParams<{ issueId: string }>();
  const { colors } = useTheme();

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `Issue ${issueId ? issueId.slice(0, 8) : ''}`,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerLeft: () => <BackButton />,
        }}
      />
      <EmptyState
        icon="warning-outline"
        title="Issue Details"
        description="Issue reporting and dispute resolution will be available in a future update."
      />
    </Screen>
  );
}
