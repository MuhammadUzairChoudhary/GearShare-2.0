import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { getRentalStatusLabel, type RentalStatus } from '../../types/rental';
import { motionDuration, motionEasing, usePrefersReducedMotion } from '../../theme/motion';
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

const DISPLAY_STAGES: RentalStatus[] = ['request_sent', 'confirmed', 'active', 'completed'];

/** Screen-reader description — never communicates state by colour alone. */
function statusDescription(status: RentalStatus): string {
  if (status === 'cancelled') {
    return 'This rental was cancelled.';
  }
  const base = `Rental status: ${getRentalStatusLabel(status)}.`;
  switch (status) {
    case 'request_sent':
      return `${base} Your request is awaiting the owner's confirmation.`;
    case 'waiting_for_owner':
      return `${base} Waiting for the owner to respond.`;
    case 'action_required':
      return `${base} Action needed from you.`;
    case 'confirmed':
      return `${base} Pickup confirmed.`;
    case 'pickup_due':
      return `${base} Pickup is due.`;
    case 'active':
      return `${base} Rental is in progress.`;
    case 'return_due':
      return `${base} Return is due.`;
    case 'under_review':
      return `${base} An issue is under review.`;
    case 'completed':
      return `${base} Rental complete.`;
    default:
      return base;
  }
}

/**
 * Alpine status rail: REQUEST — CONFIRMED — PICKUP — ACTIVE — RETURN — COMPLETE
 * (rendered as the four key milestones).
 *
 * - Current state: Signal Lime. Completed: muted lime track. Future: graphite.
 * - Animates only when the status changes: 240 ms linear fill, short settle, no pulse.
 * - Future steps are not tappable — the rail is a status summary, not a timeline.
 */
export function StatusRail({ currentStatus, testID }: StatusRailProps) {
  const { colors } = useTheme();
  const reducedMotion = usePrefersReducedMotion();

  const currentIndex = STATUS_POSITION[currentStatus];
  const isCancelled = currentStatus === 'cancelled';

  // Progress across 4 milestones (0…4). Initialized to the current status so
  // freshly-mounted cards render without an entrance animation.
  const progress = useRef(new Animated.Value(Math.max(currentIndex, 0))).current;
  const previousStatus = useRef(currentStatus);

  useEffect(() => {
    if (previousStatus.current === currentStatus) return;
    previousStatus.current = currentStatus;

    const next = STATUS_POSITION[currentStatus];
    if (next < 0 || reducedMotion) {
      progress.setValue(Math.max(next, 0));
      return;
    }

    Animated.timing(progress, {
      toValue: next,
      duration: motionDuration.deliberate,
      easing: motionEasing.standard,
      useNativeDriver: true,
    }).start();
  }, [currentStatus, progress, reducedMotion]);

  if (isCancelled) {
    return (
      <View testID={testID}>
        <AppText variant="labelMedium" color="error">
          This rental was cancelled
        </AppText>
      </View>
    );
  }

  return (
    <View
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
      accessibilityRole="summary"
      accessibilityLabel={statusDescription(currentStatus)}
    >
      {DISPLAY_STAGES.map((status, index) => {
        const position = STATUS_POSITION[status]!;
        const isLast = index === DISPLAY_STAGES.length - 1;

        // Node i is reached when progress >= i.
        const nodeOpacity = progress.interpolate({
          inputRange: [position - 1, position],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });
        // Segment i (between node i and i+1) fills as progress moves from i to i+1.
        const segmentScale = progress.interpolate({
          inputRange: [position, position + 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        return (
          <React.Fragment key={status}>
            <View style={{ position: 'relative', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              {/* Base (future) node */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.graphite700,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.graphite500 }} />
              </View>
              {/* Active (lime) node overlay */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.signalLime,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: nodeOpacity,
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.carbon950 }} />
              </Animated.View>
            </View>
            {!isLast && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: colors.graphite700,
                  borderRadius: radius.chip,
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={{
                    width: '100%',
                    height: 2,
                    backgroundColor: colors.signalLime,
                    transform: [{ scaleX: segmentScale }],
                    transformOrigin: 'left center',
                  }}
                />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

