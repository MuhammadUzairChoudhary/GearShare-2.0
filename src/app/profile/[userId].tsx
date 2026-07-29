import React from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Screen } from '../../components/ui/Screen';
import { IconButton } from '../../components/ui/IconButton';
import { OwnerSummaryCard } from '../../components/ui/OwnerSummaryCard';
import { Divider } from '../../components/ui/Divider';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/feedback/EmptyState';
import { spacing } from '../../theme/spacing';
import { mockProfiles, mockReviews } from '../../mocks/data';

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { colors } = useTheme();

  const profile = mockProfiles.find((p) => p.id === userId);
  const reviews = mockReviews.filter((r) => r.reviewedUserId === userId);

  if (!profile) {
    return (
      <Screen>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Profile',
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
        <EmptyState icon="person-outline" title="User not found" />
      </Screen>
    );
  }

  const reviewCount = profile.ratingCount;
  const avgRating = profile.ratingAverage;

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: profile.fullName,
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
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxxl, gap: spacing.xxl }}>
        <OwnerSummaryCard owner={profile} compact={false} />

        <Card>
          <View style={{ gap: spacing.md }}>
            <AppText variant="titleSmall">Member since</AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </AppText>
          </View>
        </Card>

        {reviews.length > 0 && (
          <>
            <Divider />
            <AppText variant="titleSmall">Reviews ({reviews.length})</AppText>
            <View style={{ gap: spacing.md }}>
              {reviews.map((review) => (
                <Card key={review.id}>
                  <View style={{ gap: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Chip label={`${review.rating.overall}/5`} variant="active" />
                    </View>
                    {review.feedback && (
                      <AppText variant="bodyMedium" color="textSecondary">
                        {review.feedback}
                      </AppText>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
