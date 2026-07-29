import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { RENTAL_STATUS_ORDER, getRentalStatusLabel, type RentalStatus } from '../../types/rental';
import { AppText } from './AppText';

interface StatusRailProps {
  currentStatus: RentalStatus;
  testID?: string;
}

const STATUS_POSITION: Record<RentalStatus, number> = {
  request_sent: 0,
  waiting_for_owner: 1,
  action_required: 1,
  confirmed: 2,
  pickup_due: 2,
  active: 3,
  return_due: 3,
  under_review: 4,
  completed: 4,
  cancelled: -1,
};

export function StatusRail({ currentStatus, testID }: StatusRailProps) {
  const { colors } = useTheme();

  const currentIndex = STATUS_POSITION[currentStatus];
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <View testID={testID}>
        <AppText variant="labelMedium" color="error">
          This rental was cancelled
        </AppText>
      </View>
    );
  }

  const displayStatuses: RentalStatus[] = ['request_sent', 'confirmed', 'active', 'completed'];

  return (
    <View
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
      accessibilityLabel={`Rental progress: ${getRentalStatusLabel(currentStatus)}`}
    >
      {displayStatuses.map((status, index) => {
        const position = STATUS_POSITION[status]!;
        const isActive = position <= currentIndex;
        const isLast = index === displayStatuses.length - 1;

        return (
          <React.Fragment key={status}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: isActive ? colors.signalLime : colors.graphite700,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isActive ? colors.carbon950 : colors.graphite500,
                }}
              />
            </View>
            {!isLast && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isActive ? colors.signalLime : colors.graphite700,
                  borderRadius: radius.chip,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
