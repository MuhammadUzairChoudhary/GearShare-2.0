import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/feedback/EmptyState';
import { spacing } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';

export default function OwnerDashboardScreen() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          icon="briefcase-outline"
          title="Owner dashboard"
          description="Sign in to manage your listings and rental requests."
          actionLabel="Sign In"
          onAction={() => router.push(ROUTES.AUTH.SIGN_IN)}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: spacing.xxl, paddingTop: spacing.xxxl }}>
        <View>
          <AppText variant="displayMedium">Owner</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            Manage your gear and rental requests
          </AppText>
        </View>

        <Card onPress={() => router.push(ROUTES.OWNER.NEW_LISTING)}>
          <AppText variant="titleSmall">List New Gear</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            Create a new listing for your equipment
          </AppText>
        </Card>

        <Card onPress={() => {}}>
          <AppText variant="titleSmall">Rental Requests</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            Review and manage incoming requests
          </AppText>
        </Card>

        <Card onPress={() => {}}>
          <AppText variant="titleSmall">My Listings</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            View and edit your listed equipment
          </AppText>
        </Card>

        <Card onPress={() => {}}>
          <AppText variant="titleSmall">Earnings</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            Track your rental income
          </AppText>
        </Card>
      </View>
    </Screen>
  );
}
