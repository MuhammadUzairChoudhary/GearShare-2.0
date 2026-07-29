import React from 'react';
import { View, Image, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { Card } from './Card';
import { AppText } from './AppText';
import { MoneyText } from './MoneyText';
import { Chip } from './Chip';
import type { Listing } from '../../types/listing';

interface ListingCardProps {
  listing: Listing;
  onPress: (listingId: string) => void;
  testID?: string;
}

export function ListingCard({ listing, onPress, testID }: ListingCardProps) {
  const { colors } = useTheme();
  const gearItem = listing.gearItem;
  const primaryImage = listing.images?.[0];

  const containerStyle: ViewStyle = {
    gap: spacing.md,
  };

  return (
    <Card
      onPress={() => onPress(listing.id)}
      padded={false}
      testID={testID}
      accessibilityLabel={`${gearItem?.name ?? 'Listing'} - ${listing.dailyPrice / 100} dollars per day`}
    >
      <View style={containerStyle}>
        {/* Image */}
        <View
          style={{
            height: 200,
            backgroundColor: colors.surface,
            borderRadius: radius.card,
            overflow: 'hidden',
          }}
        >
          {primaryImage?.storagePath ? (
            <Image
              source={{ uri: primaryImage.storagePath }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText variant="bodySmall" color="textTertiary">
                No image
              </AppText>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          {/* Category chip */}
          {gearItem?.category && (
            <Chip
              label={gearItem.category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              variant="default"
            />
          )}

          {/* Title & brand */}
          <AppText variant="titleMedium" numberOfLines={1}>
            {gearItem?.name ?? 'Unknown Item'}
          </AppText>
          {(gearItem?.brand || gearItem?.model) && (
            <AppText variant="bodySmall" color="textSecondary">
              {[gearItem?.brand, gearItem?.model].filter(Boolean).join(' ')}
            </AppText>
          )}

          {/* Price */}
          <MoneyText variant="dailyPrice" minorUnits={listing.dailyPrice} />
        </View>
      </View>
    </Card>
  );
}
