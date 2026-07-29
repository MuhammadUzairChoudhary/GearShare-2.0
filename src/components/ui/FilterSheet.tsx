import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { Chip } from './Chip';
import { BottomSheet, type BottomSheetRef } from './BottomSheet';
import { Divider } from './Divider';
import type { GearCondition } from '../../types/gear';
import type { ListingSortOption } from '../../types/search';

interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  maxDeposit?: number;
  verifiedOwnersOnly: boolean;
  minRating?: number;
  conditions: GearCondition[];
  sort: ListingSortOption;
}

interface FilterSheetProps {
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  resultCount?: number;
  testID?: string;
}

export type { FilterState, FilterSheetProps };

export const FilterSheet = React.forwardRef<BottomSheetRef, FilterSheetProps>(function FilterSheet(
  { currentFilters, onApply, resultCount, testID },
  ref,
) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<FilterState>(currentFilters);

  const conditions: GearCondition[] = ['new', 'like_new', 'good', 'fair', 'wear'];

  const sortOptions: { label: string; value: ListingSortOption }[] = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Lowest Price', value: 'lowest_price' },
    { label: 'Lowest Deposit', value: 'lowest_deposit' },
    { label: 'Highest Rated', value: 'highest_rated' },
    { label: 'Most Rented', value: 'most_rented' },
    { label: 'Recently Added', value: 'recently_added' },
  ];

  return (
    <BottomSheet ref={ref} testID={testID}>
      <ScrollView style={{ maxHeight: '90%' }} contentContainerStyle={{ gap: spacing.xl }}>
        <AppText variant="titleMedium">Filters</AppText>

        {/* Sort */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="labelLarge" color="textSecondary">
            Sort by
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {sortOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                variant={draft.sort === option.value ? 'active' : 'default'}
                onPress={() => setDraft((prev) => ({ ...prev, sort: option.value }))}
              />
            ))}
          </View>
        </View>

        <Divider />

        {/* Price range */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="labelLarge" color="textSecondary">
            Daily price
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <PriceInput
              label="Min"
              value={draft.minPrice}
              onChange={(v) => setDraft((prev) => ({ ...prev, minPrice: v }))}
            />
            <PriceInput
              label="Max"
              value={draft.maxPrice}
              onChange={(v) => setDraft((prev) => ({ ...prev, maxPrice: v }))}
            />
          </View>
        </View>

        {/* Max deposit */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="labelLarge" color="textSecondary">
            Max deposit
          </AppText>
          <PriceInput
            label="Max deposit"
            value={draft.maxDeposit}
            onChange={(v) => setDraft((prev) => ({ ...prev, maxDeposit: v }))}
          />
        </View>

        <Divider />

        {/* Rating */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="labelLarge" color="textSecondary">
            Minimum rating
          </AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[3, 3.5, 4, 4.5].map((rating) => (
              <Chip
                key={rating}
                label={`${rating}+`}
                variant={draft.minRating === rating ? 'active' : 'default'}
                onPress={() =>
                  setDraft((prev) => ({
                    ...prev,
                    minRating: prev.minRating === rating ? undefined : rating,
                  }))
                }
              />
            ))}
          </View>
        </View>

        {/* Verified owners */}
        <View style={{ gap: spacing.md }}>
          <Chip
            label="Verified owners only"
            variant={draft.verifiedOwnersOnly ? 'active' : 'default'}
            onPress={() =>
              setDraft((prev) => ({
                ...prev,
                verifiedOwnersOnly: !prev.verifiedOwnersOnly,
              }))
            }
          />
        </View>

        <Divider />

        {/* Condition */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="labelLarge" color="textSecondary">
            Condition
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {conditions.map((condition) => (
              <Chip
                key={condition}
                label={condition.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                variant={draft.conditions.includes(condition) ? 'active' : 'default'}
                onPress={() =>
                  setDraft((prev) => ({
                    ...prev,
                    conditions: prev.conditions.includes(condition)
                      ? prev.conditions.filter((c) => c !== condition)
                      : [...prev.conditions, condition],
                  }))
                }
              />
            ))}
          </View>
        </View>

        <Divider />

        {/* Actions */}
        <View style={{ gap: spacing.md }}>
          <AppButton
            title={`Show Results${resultCount !== undefined ? ` (${resultCount})` : ''}`}
            onPress={() => onApply(draft)}
            variant="primary"
            fullWidth
            size="lg"
          />
          <AppButton
            title="Clear All"
            onPress={() =>
              setDraft({
                minPrice: undefined,
                maxPrice: undefined,
                maxDeposit: undefined,
                verifiedOwnersOnly: false,
                minRating: undefined,
                conditions: [],
                sort: 'recommended',
              })
            }
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
});

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (val?: number) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <AppText variant="bodySmall" color="textTertiary">
        {label}
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radius.input,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
          height: 44,
        }}
      >
        <AppText variant="bodyMedium" color="textTertiary">
          $
        </AppText>
        <DollarInput value={value} onChange={onChange} />
      </View>
    </View>
  );
}

function DollarInput({ value, onChange }: { value?: number; onChange: (val?: number) => void }) {
  const { colors } = useTheme();
  const [text, setText] = React.useState(value ? String(value / 100) : '');

  return (
    <AppText variant="bodyMedium" color="textPrimary" style={{ flex: 1, marginLeft: 4 }}>
      {text || 'Any'}
    </AppText>
  );
}
