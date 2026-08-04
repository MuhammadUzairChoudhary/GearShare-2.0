import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../theme/ThemeContext';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { TextInput } from '../../../components/ui/TextInput';
import { IconButton } from '../../../components/ui/IconButton';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { PriceBreakdown } from '../../../components/ui/PriceBreakdown';
import { OwnerSummaryCard } from '../../../components/ui/OwnerSummaryCard';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useListing } from '../../../hooks/useListings';
import { useCreateRentalRequest } from '../../../hooks/useRentals';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { useRentalDraftStore } from '../../../stores/useRentalDraftStore';
import { spacing } from '../../../theme/spacing';
import { ROUTES } from '../../../constants/routes';
import { getAnalyticsService } from '../../../services/analytics';
import { calculateRentalDays, formatMoney } from '../../../utils/money';
import type { PendingAuthIntent } from '../../../types/auth-intent';

const FEE_RATE = 0.1;
const PROTECTION_RATE = 0.03;
const TAX_RATE = 0.05;

export default function RentalRequestScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { colors } = useTheme();
  const { isAuthenticated, user, setPendingAction } = useAuthContext();
  const { data: listing, isLoading, isError, refetch } = useListing(listingId ?? '');
  const createRental = useCreateRentalRequest();
  const draft = useRentalDraftStore();

  const [startDate, setStartDate] = useState(draft.startDate ?? '');
  const [endDate, setEndDate] = useState(draft.endDate ?? '');
  const [pickupWindow, setPickupWindow] = useState('');
  const [intendedUse, setIntendedUse] = useState(draft.intendedUse ?? '');
  const [destination, setDestination] = useState('');
  const [messageToOwner, setMessageToOwner] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    try {
      return calculateRentalDays(startDate, endDate);
    } catch {
      return 0;
    }
  }, [startDate, endDate]);

  const dailyPrice = listing?.dailyPrice ?? 0;
  const rentalCharge = dailyPrice * days;
  const serviceFee = Math.round(rentalCharge * FEE_RATE);
  const protectionFee = Math.round(rentalCharge * PROTECTION_RATE);
  const taxes = Math.round(rentalCharge * TAX_RATE);
  const totalCharge = rentalCharge + serviceFee + protectionFee + taxes;
  const depositAmount = listing?.depositAmount ?? 0;

  const isDateValid = days > 0;
  const canSubmit =
    isDateValid && intendedUse.trim().length > 0 && agreeToTerms && !createRental.isPending;

  const handleAuthGate = useCallback(() => {
    if (!isAuthenticated) {
      draft.setListingId(listingId ?? '');
      draft.setDates(startDate, endDate);
      draft.setIntendedUse(intendedUse);
      const intent: PendingAuthIntent = {
        type: 'request-rental',
        listingId: listingId ?? '',
        draftId: undefined,
      };
      setPendingAction(intent);
      router.push(ROUTES.AUTH.SIGN_IN);
      return false;
    }
    return true;
  }, [isAuthenticated, listingId, startDate, endDate, intendedUse, draft, setPendingAction]);

  const handleSubmit = useCallback(async () => {
    if (!handleAuthGate()) return;

    if (!listing || !user) return;

    setSubmitError(null);

    try {
      getAnalyticsService().trackEvent({
        name: 'rental_request_started',
        params: { listingId: listingId ?? '' },
      });

      const result = await createRental.mutateAsync({
        listingId: listing.id,
        startDate,
        endDate,
        intendedUse: intendedUse || undefined,
        renterId: user.id,
        pickupWindow: pickupWindow || undefined,
      });

      getAnalyticsService().trackEvent({
        name: 'rental_request_submitted',
        params: {
          listingId: listing.id,
          rentalValueMinor: result.rentalCharge,
          depositMinor: result.depositHold,
        },
      });

      draft.reset();
      router.replace(`/rental/${result.id}` as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit rental request';
      setSubmitError(message);
      getAnalyticsService().trackEvent({
        name: 'rental_request_failed',
        params: { listingId: listingId ?? '', reason: message },
      });
    }
  }, [
    listing,
    user,
    startDate,
    endDate,
    intendedUse,
    pickupWindow,
    listingId,
    createRental,
    draft,
    handleAuthGate,
  ]);

  if (isLoading) return <LoadingState message="Loading listing..." />;

  if (isError || !listing) {
    return (
      <Screen>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Rental Request',
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
        <ErrorState onRetry={() => refetch()} />
      </Screen>
    );
  }

  const gearItem = listing.gearItem;

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Rental Request',
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
        {/* Equipment summary */}
        <Card>
          <View style={{ gap: spacing.md }}>
            <AppText variant="titleMedium">{gearItem?.name ?? 'Equipment'}</AppText>
            {(gearItem?.brand || gearItem?.model) && (
              <AppText variant="bodyMedium" color="textSecondary">
                {[gearItem?.brand, gearItem?.model].filter(Boolean).join(' ')}
              </AppText>
            )}
            <AppText variant="bodySmall" color="textTertiary">
              {formatMoney(dailyPrice)}/day · Deposit: {formatMoney(depositAmount)}
            </AppText>
          </View>
        </Card>

        {/* Owner summary */}
        {listing.owner && <OwnerSummaryCard owner={listing.owner} compact />}

        <Divider />

        {/* Dates */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="titleSmall">Rental Dates</AppText>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <DateInput label="Pickup date" value={startDate} onChange={setStartDate} />
            <DateInput label="Return date" value={endDate} onChange={setEndDate} />
          </View>
          {days > 0 && (
            <AppText variant="bodyMedium" color="textSecondary">
              {days} day{days > 1 ? 's' : ''}
            </AppText>
          )}
        </View>

        {/* Pickup window */}
        <TextInput
          label="Preferred pickup window (optional)"
          value={pickupWindow}
          onChangeText={setPickupWindow}
          placeholder="e.g. Aug 15 9-11 AM"
          hint="When do you plan to pick up the equipment?"
        />

        <Divider />

        {/* Intended use */}
        <TextInput
          label="How will you use this equipment?"
          value={intendedUse}
          onChangeText={setIntendedUse}
          placeholder="e.g. Backpacking trip in the Wallowas"
          multiline
          hint="This helps the owner understand your needs"
        />

        {/* Destination */}
        <TextInput
          label="General destination (optional)"
          value={destination}
          onChangeText={setDestination}
          placeholder="e.g. Wallowa Mountains, OR"
          hint="Where will you be taking the equipment?"
        />

        {/* Message to owner */}
        <TextInput
          label="Message to owner (optional)"
          value={messageToOwner}
          onChangeText={setMessageToOwner}
          placeholder="Any questions or special requests?"
          multiline
        />

        <Divider />

        {/* Price breakdown */}
        {days > 0 && (
          <PriceBreakdown
            dailyPrice={dailyPrice}
            days={days}
            rentalCharge={rentalCharge}
            serviceFee={serviceFee}
            protectionFee={protectionFee}
            taxes={taxes}
            totalCharge={totalCharge}
            depositAmount={depositAmount}
          />
        )}

        {/* Payment method placeholder */}
        <Card>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="titleSmall">Payment method</AppText>
            <AppText variant="bodyMedium" color="textTertiary">
              Payment integration will be available in a future update.
            </AppText>
          </View>
        </Card>

        <Divider />

        {/* Terms acceptance */}
        <View style={{ gap: spacing.md }}>
          <AppButton
            title={agreeToTerms ? '✓ I agree to the terms' : 'I agree to the terms'}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            variant={agreeToTerms ? 'primary' : 'secondary'}
            fullWidth
          />
          <AppText variant="bodySmall" color="textTertiary">
            By agreeing, you accept the cancellation, damage, and cleaning policies set by the
            owner.
          </AppText>
        </View>

        {/* Error */}
        {submitError && (
          <AppText variant="bodyMedium" color="error" accessibilityRole="alert">
            {submitError}
          </AppText>
        )}

        {/* Submit */}
        <AppButton
          title="Submit Rental Request"
          onPress={handleSubmit}
          variant="primary"
          fullWidth
          size="large"
          disabled={!canSubmit}
          loading={createRental.isPending}
        />
        <AppText variant="bodySmall" color="textTertiary" align="center">
          You won't be charged yet. The owner will confirm your request.
        </AppText>
      </ScrollView>
    </Screen>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <AppText variant="bodySmall" color="textTertiary">
        {label}
      </AppText>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
          height: 48,
          justifyContent: 'center',
        }}
      >
        <AppText variant="bodyMedium" mono color={value ? 'textPrimary' : 'textTertiary'}>
          {value || 'Select date'}
        </AppText>
      </View>
    </View>
  );
}
