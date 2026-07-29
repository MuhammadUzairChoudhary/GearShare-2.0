import React from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '../../../theme/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { IconButton } from '../../../components/ui/IconButton';
import { spacing } from '../../../theme/spacing';

export default function NewListingScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'New Listing',
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
      <ScrollView contentContainerStyle={{ gap: spacing.xxl, paddingBottom: spacing.xxxxl }}>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="displayMedium">List Your Gear</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            Share your equipment with the community.
          </AppText>
        </View>

        <AppText variant="bodyMedium" color="textSecondary">
          This is a placeholder for the listing creation form. Full implementation will include:
        </AppText>

        <View style={{ gap: spacing.md }}>
          {[
            'Equipment details (name, brand, model, category)',
            'Condition assessment',
            'Pricing (daily rate, deposit)',
            'Photos',
            'Availability calendar',
            'Pickup instructions',
            'Policies',
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <AppText variant="bodyMedium" color="textTertiary">
                •
              </AppText>
              <AppText variant="bodyMedium" color="textSecondary">
                {item}
              </AppText>
            </View>
          ))}
        </View>

        <AppButton title="Save Draft" onPress={() => {}} variant="secondary" fullWidth />
      </ScrollView>
    </Screen>
  );
}
