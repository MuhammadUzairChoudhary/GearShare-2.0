import React, { useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { RentalSummaryCard } from '../../../components/ui/RentalSummaryCard';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Chip } from '../../../components/ui/Chip';
import { useUserRentals } from '../../../hooks/useRentals';
import { spacing } from '../../../theme/spacing';
import { ROUTES } from '../../../constants/routes';
import { getRentalStatusVariant, type Rental, type RentalStatus } from '../../../types/rental';

export default function RentalsScreen() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const {
    data: rentals,
    isLoading: rentalsLoading,
    isError,
    refetch,
  } = useUserRentals(isAuthenticated ? (user?.id ?? '') : '');

  // Always call hooks before conditional returns
  const [activeTab, setActiveTab] = React.useState<'all' | 'upcoming' | 'past'>('all');

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    if (activeTab === 'all') return rentals;
    if (activeTab === 'upcoming') {
      const activeStatuses: RentalStatus[] = [
        'request_sent',
        'waiting_for_owner',
        'action_required',
        'confirmed',
        'pickup_due',
        'active',
        'return_due',
        'under_review',
      ];
      return rentals.filter((r) => activeStatuses.includes(r.status));
    }
    return rentals.filter((r) => r.status === 'completed' || r.status === 'cancelled');
  }, [rentals, activeTab]);

  if (authLoading) {
    return (
      <Screen>
        <LoadingState message="Loading rentals..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={{ paddingTop: spacing.xxxl }}>
          <AppText variant="displayMedium">Rentals</AppText>
          <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: spacing.sm }}>
            Sign in to see your rentals.
          </AppText>
          <View style={{ marginTop: spacing.xxl }}>
            <AppButton
              title="Sign In"
              onPress={() => router.push(ROUTES.AUTH.SIGN_IN)}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </Screen>
    );
  }

  if (rentalsLoading) {
    return (
      <Screen>
        <LoadingState message="Loading rentals..." />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => refetch()} />
      </Screen>
    );
  }

  const handleRentalPress = (rentalId: string) => {
    router.push(ROUTES.RENTAL(rentalId));
  };

  return (
    <Screen>
      <View style={{ paddingTop: spacing.xxxl }}>
        <AppText variant="displayMedium">Rentals</AppText>
      </View>

      {/* Tab filters */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg }}>
        <Chip
          label="All"
          variant={activeTab === 'all' ? 'active' : 'default'}
          onPress={() => setActiveTab('all')}
        />
        <Chip
          label="Upcoming"
          variant={activeTab === 'upcoming' ? 'active' : 'default'}
          onPress={() => setActiveTab('upcoming')}
        />
        <Chip
          label="Past"
          variant={activeTab === 'past' ? 'active' : 'default'}
          onPress={() => setActiveTab('past')}
        />
      </View>

      {!rentals || rentals.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No rentals yet"
          description="Your upcoming and past rentals will appear here."
          actionLabel="Discover Gear"
          onAction={() => router.push(ROUTES.TABS.DISCOVER)}
        />
      ) : filteredRentals.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={`No ${activeTab} rentals`}
          description={`You don't have any ${activeTab} rentals at the moment.`}
        />
      ) : (
        <FlatList
          data={filteredRentals}
          keyExtractor={(item: Rental) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing.lg }}>
              <RentalSummaryCard rental={item} onPress={() => handleRentalPress(item.id)} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: spacing.xxxxl }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}
