import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { IconButton } from '../../components/ui/IconButton';
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
          headerLeft: () => (
            <IconButton
              icon="arrow-back"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            />
          ),
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
