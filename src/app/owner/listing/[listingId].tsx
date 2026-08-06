import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../theme/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { BackButton } from '../../../components/ui/BackButton';
import { EmptyState } from '../../../components/feedback/EmptyState';

export default function EditListingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { colors } = useTheme();

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Edit Listing',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerLeft: () => <BackButton />,
        }}
      />
      <EmptyState
        icon="create-outline"
        title="Edit Listing"
        description={`Listing ${listingId} editing will be available soon.`}
      />
    </Screen>
  );
}
