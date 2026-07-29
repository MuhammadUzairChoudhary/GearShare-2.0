import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { Card } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Divider } from '../../../components/ui/Divider';
import { Chip } from '../../../components/ui/Chip';
import { spacing } from '../../../theme/spacing';
import { ROUTES } from '../../../constants/routes';

export default function AccountScreen() {
  const { isAuthenticated, isLoading, user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTES.TABS.DISCOVER);
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Account</AppText>
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Account</AppText>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
          <AppText variant="bodyLarge" color="textSecondary" align="center">
            Sign in to manage your account.
          </AppText>
          <AppButton
            title="Sign In"
            onPress={() => router.push(ROUTES.AUTH.SIGN_IN)}
            variant="primary"
            fullWidth
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxxl }}>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Account</AppText>
        </View>

        <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
          {/* Profile card */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <Avatar name={user?.email ?? 'User'} size="xl" />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <AppText variant="titleMedium">{user?.user_metadata?.full_name ?? 'User'}</AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {user?.email}
                </AppText>
                <Chip label="Renter" variant="accent" />
              </View>
            </View>
          </Card>

          <Divider />

          {/* Owner section */}
          <View style={{ gap: spacing.lg }}>
            <AppText variant="titleSmall">Owner Tools</AppText>
            <AppButton
              title="Manage Listings"
              onPress={() => router.push(ROUTES.OWNER.INDEX)}
              variant="secondary"
              fullWidth
            />
            <AppButton
              title="List New Gear"
              onPress={() => router.push(ROUTES.OWNER.NEW_LISTING)}
              variant="secondary"
              fullWidth
            />
          </View>

          <Divider />

          {/* Sign out */}
          <AppButton title="Sign Out" onPress={handleSignOut} variant="ghost" fullWidth />
        </View>
      </ScrollView>
    </Screen>
  );
}
