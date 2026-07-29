import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Card } from './Card';
import { Chip } from './Chip';
import type { Profile } from '../../types/profile';

interface OwnerSummaryCardProps {
  owner: Profile;
  onPress?: () => void;
  compact?: boolean;
  testID?: string;
}

export function OwnerSummaryCard({
  owner,
  onPress,
  compact = false,
  testID,
}: OwnerSummaryCardProps) {
  const { colors } = useTheme();

  const isVerified = owner.verificationStatus === 'verified';

  return (
    <Card onPress={onPress} testID={testID}>
      <View style={{ gap: spacing.md }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar uri={owner.avatarUrl} name={owner.fullName} size={compact ? 'sm' : 'md'} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AppText variant="titleSmall">{owner.fullName}</AppText>
              {isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.signalLime} />
              )}
            </View>
            {owner.location && (
              <AppText variant="bodySmall" color="textSecondary">
                {owner.location}
              </AppText>
            )}
          </View>
        </View>

        {/* Rating */}
        {owner.ratingAverage !== null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <AppText variant="bodyMedium" mono>
              {owner.ratingAverage.toFixed(1)}
            </AppText>
            <AppText variant="bodySmall" color="textTertiary">
              ({owner.ratingCount} rental{owner.ratingCount !== 1 ? 's' : ''})
            </AppText>
          </View>
        )}

        {/* Verification */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {owner.verificationStatus === 'verified' ? (
            <Chip label="Verified" variant="accent" />
          ) : (
            <Chip label="Unverified" variant="default" />
          )}
          {owner.isOwner && <Chip label="Owner" variant="default" />}
        </View>

        {/* Bio */}
        {owner.bio && !compact && (
          <AppText variant="bodyMedium" color="textSecondary" numberOfLines={3}>
            {owner.bio}
          </AppText>
        )}
      </View>
    </Card>
  );
}
