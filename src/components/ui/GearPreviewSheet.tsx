import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { AppIcon } from './Icons';
import { formatMoney } from '../../utils/money';
import type { Listing } from '../../types/listing';

interface GearPreviewSheetProps {
  visible: boolean;
  listing: Listing | null | undefined;
  onClose: () => void;
  testID?: string;
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  wear: 'Worn',
};

const titleCase = (value: string) =>
  value.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Gear preview bottom sheet — the shared product detail shown from the rental
 * flow's "gear preview card" and the chat window's gear card.
 *
 * Mirrors the full listing detail screen ("product gear screen") exactly:
 * hero image with pagination dots, category, title, rating + ID badges, the
 * pricing card (estimated total + security deposit), technical specifications,
 * gear condition, the owner card with verified badge, description, and
 * platform policies. Fully data-driven — falls back gracefully when a section
 * has no data (no phantom placeholder content).
 */
export function GearPreviewSheet({ visible, listing, onClose, testID }: GearPreviewSheetProps) {
  const { colors } = useTheme();
  const [activeImage, setActiveImage] = useState(0);

  const gear = listing?.gearItem;
  const owner = listing?.owner;
  const images = listing?.images ?? [];
  const specs = gear?.specifications ? Object.entries(gear.specifications) : [];
  const policies = listing?.policies ?? [];
  const price = listing?.dailyPrice ?? 0;
  const deposit = listing?.depositAmount ?? 0;
  const estTotal = price * 3;
  const rating = owner?.ratingAverage ?? 0;
  const ratingCount = owner?.ratingCount ?? 0;
  const isVerified = owner?.verificationStatus === 'verified';
  const categoryLabel = gear?.category ? titleCase(gear.category) : '';

  // Pair spec entries into 2-column rows, exactly like the product screen.
  const specRows: Array<[string, string][]> = [];
  for (let i = 0; i < specs.length; i += 2) {
    specRows.push(specs.slice(i, i + 2) as Array<[string, string]>);
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Backdrop tap to close */}
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
          onPress={onClose}
          accessibilityLabel="Dismiss gear details"
        />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: radius.bottomSheet,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            overflow: 'hidden',
            height: '85%',
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#DDE1E3',
              borderRadius: 2,
              alignSelf: 'center',
              marginTop: spacing.sm,
              marginBottom: spacing.sm,
            }}
          />

          {/* ── Hero image — full-bleed, pagination dots, floating close ── */}
          <View>
            {images.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setActiveImage(index);
                }}
              >
                {images.map((img) => (
                  <Image
                    key={img.id}
                    source={{ uri: img.storagePath }}
                    style={{ width: SCREEN_WIDTH, height: 220, backgroundColor: '#ECEEEF' }}
                    resizeMode="cover"
                    accessibilityRole="image"
                    accessibilityLabel="Gear photo"
                  />
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  width: '100%',
                  height: 220,
                  backgroundColor: colors.graphite300,
                  opacity: 0.3,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="image-outline" size={28} color="rgba(44,48,52,0.25)" />
              </View>
            )}

            {/* Pagination dots */}
            {images.length > 1 && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 16,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: 'rgba(31,34,37,0.3)',
                  borderRadius: 9999,
                }}
              >
                {images.map((_, j) => (
                  <View
                    key={j}
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: j === activeImage ? '#C8FF3D' : 'rgba(255,255,255,0.5)',
                      borderRadius: 9999,
                    }}
                  />
                ))}
              </View>
            )}

            {/* Close — floating like the product screen's header actions */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: 'absolute',
                top: 12,
                right: spacing.lg,
                width: 40,
                height: 40,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderWidth: 1,
                borderColor: '#DDE1E3',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Close gear details"
            >
              <Ionicons name="close" size={16} color="#1F2225" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* ── Listing info — category, title, rating + ID badges ── */}
            <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 14 }}>
              {categoryLabel ? (
                <Text
                  style={{
                    fontFamily: fontFamilies.ibmPlexMono.semiBold,
                    fontSize: rf(10),
                    lineHeight: rf(15),
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: 'rgba(44,48,52,0.4)',
                  }}
                >
                  {categoryLabel}
                </Text>
              ) : null}

              <Text
                style={{
                  fontFamily: fontFamilies.spaceGrotesk.bold,
                  fontSize: rf(24),
                  lineHeight: rf(32),
                  letterSpacing: -0.6,
                  color: '#1F2225',
                }}
              >
                {gear?.name ?? 'Product Details'}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {/* Rating badge */}
                {rating > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: colors.white,
                      borderWidth: 1,
                      borderColor: '#DDE1E3',
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ fontSize: rf(11.25), color: '#FACC15', lineHeight: rf(12) }}>★</Text>
                    <Text
                      style={{
                        fontFamily: fontFamilies.inter.bold,
                        fontSize: rf(10),
                        lineHeight: rf(15),
                        letterSpacing: -0.009,
                        color: '#1F2225',
                      }}
                    >
                      {rating.toFixed(1)} ({ratingCount} reviews)
                    </Text>
                  </View>
                )}

                {/* ID badge */}
                {listing?.id ? (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#1F2225', borderRadius: 4 }}>
                    <Text
                      style={{
                        fontFamily: fontFamilies.ibmPlexMono.regular,
                        fontSize: rf(9),
                        lineHeight: rf(14),
                        letterSpacing: 0.9,
                        textTransform: 'uppercase',
                        color: colors.white,
                      }}
                    >
                      ID: {listing.id.toUpperCase().slice(0, 8)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* ── Pricing card — estimated total + deposit ── */}
            <View
              style={{
                marginHorizontal: spacing.xl,
                marginTop: 20,
                padding: spacing.xl,
                backgroundColor: '#F8F9F9',
                borderWidth: 1,
                borderColor: '#DDE1E3',
                borderRadius: radius.card,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.ibmPlexMono.semiBold,
                  fontSize: rf(10),
                  lineHeight: rf(15),
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: 'rgba(44,48,52,0.4)',
                  marginBottom: 8,
                }}
              >
                Estimated Total
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4, flexShrink: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    flexShrink: 1,
                    fontFamily: fontFamilies.spaceGrotesk.bold,
                    fontSize: rf(28),
                    lineHeight: rf(34),
                    letterSpacing: -0.5,
                    color: '#1F2225',
                  }}
                >
                  {formatMoney(estTotal)}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    flexShrink: 1,
                    fontFamily: fontFamilies.inter.semiBold,
                    fontSize: rf(14),
                    lineHeight: rf(20),
                    color: 'rgba(44,48,52,0.5)',
                  }}
                >
                  for 3 days
                </Text>
              </View>

              <Text
                numberOfLines={1}
                style={{
                  flexShrink: 1,
                  fontFamily: fontFamilies.inter.regular,
                  fontSize: rf(12),
                  lineHeight: rf(16),
                  letterSpacing: 0.2,
                  color: 'rgba(44,48,52,0.4)',
                  marginBottom: 20,
                }}
              >
                ({formatMoney(price)} / day)
              </Text>

              <View style={{ height: 1, backgroundColor: '#ECEEEF', marginBottom: 20 }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text
                    style={{
                      fontFamily: fontFamilies.ibmPlexMono.semiBold,
                      fontSize: rf(10),
                      lineHeight: rf(15),
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: 'rgba(44,48,52,0.4)',
                    }}
                  >
                    Security Deposit
                  </Text>
                  <AppIcon name="info" size={10} color="rgba(44,48,52,0.4)" />
                </View>
                <Text
                  style={{
                    fontFamily: fontFamilies.ibmPlexMono.semiBold,
                    fontSize: rf(16),
                    lineHeight: rf(22),
                    letterSpacing: 0.015,
                    color: '#1F2225',
                  }}
                >
                  {formatMoney(deposit)}
                </Text>
              </View>
            </View>

            {/* ── Technical specifications — 2-column rows ── */}
            {specRows.length > 0 && (
              <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16 }}>
                <Text
                  style={{
                    fontFamily: fontFamilies.spaceGrotesk.bold,
                    fontSize: rf(12),
                    lineHeight: rf(16),
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: '#1F2225',
                    paddingBottom: 8,
                  }}
                >
                  Technical Specifications
                </Text>
                <View
                  style={{
                    padding: spacing.lg,
                    backgroundColor: '#F8F9F9',
                    borderWidth: 1,
                    borderColor: '#DDE1E3',
                    borderRadius: radius.card,
                  }}
                >
                  {specRows.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      {rowIndex > 0 && <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />}
                      <View style={{ flexDirection: 'row' }}>
                        {row.map(([label, value]) => (
                          <View key={label} style={{ flex: 1, paddingVertical: 8 }}>
                            <Text
                              style={{
                                fontFamily: fontFamilies.ibmPlexMono.semiBold,
                                fontSize: rf(10),
                                lineHeight: rf(15),
                                letterSpacing: 1,
                                textTransform: 'uppercase',
                                color: 'rgba(44,48,52,0.4)',
                              }}
                            >
                              {titleCase(label)}
                            </Text>
                            <View style={{ paddingTop: 4 }}>
                              <Text
                                style={{
                                  fontFamily: fontFamilies.ibmPlexMono.semiBold,
                                  fontSize: rf(12),
                                  lineHeight: rf(20),
                                  color: '#1F2225',
                                }}
                              >
                                {value}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* ── Gear condition ── */}
            {gear?.condition && (
              <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16 }}>
                <Text
                  style={{
                    fontFamily: fontFamilies.spaceGrotesk.bold,
                    fontSize: rf(12),
                    lineHeight: rf(16),
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: '#1F2225',
                    paddingBottom: 8,
                  }}
                >
                  Gear Condition
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 16,
                    padding: spacing.lg,
                    backgroundColor: '#F8F9F9',
                    borderWidth: 1,
                    borderColor: '#DDE1E3',
                    borderRadius: radius.card,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: 'rgba(200,255,61,0.4)',
                      borderRadius: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon name="flash" size={24} color="#1F2225" />
                  </View>
                  <View style={{ flex: 1, gap: 4.5 }}>
                    <Text
                      style={{
                        fontFamily: fontFamilies.spaceGrotesk.bold,
                        fontSize: rf(14),
                        lineHeight: rf(20),
                        textTransform: 'uppercase',
                        color: '#1F2225',
                      }}
                    >
                      {CONDITION_LABELS[gear.condition] ?? titleCase(gear.condition)}
                    </Text>
                    {gear.description ? (
                      <Text
                        style={{
                          fontFamily: fontFamilies.inter.regular,
                          fontSize: rf(12),
                          lineHeight: rf(20),
                          color: 'rgba(44,48,52,0.6)',
                        }}
                      >
                        {gear.description.slice(0, 120)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            )}

            {/* ── Gear owner — avatar with verified badge, like the product screen ── */}
            {owner && (
              <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16 }}>
                <Text
                  style={{
                    fontFamily: fontFamilies.spaceGrotesk.bold,
                    fontSize: rf(12),
                    lineHeight: rf(16),
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: '#1F2225',
                    paddingBottom: 8,
                  }}
                >
                  Gear Owner
                </Text>
                <View
                  style={{
                    padding: spacing.lg,
                    backgroundColor: '#F8F9F9',
                    borderWidth: 1,
                    borderColor: '#DDE1E3',
                    borderRadius: radius.card,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                    <View style={{ width: 56, height: 56, position: 'relative' }}>
                      {owner.avatarUrl ? (
                        <Image
                          source={{ uri: owner.avatarUrl }}
                          style={{ width: 56, height: 56, borderRadius: 9999, backgroundColor: colors.graphite300 }}
                          accessibilityRole="image"
                          accessibilityLabel={`${owner.fullName}'s avatar`}
                        />
                      ) : (
                        <View style={{ width: 56, height: 56, backgroundColor: colors.graphite300, borderRadius: 9999 }} />
                      )}
                      {isVerified && (
                        <View
                          style={{
                            position: 'absolute',
                            right: -4,
                            bottom: -4,
                            width: 20,
                            height: 20,
                            backgroundColor: colors.signalLime,
                            borderWidth: 2,
                            borderColor: '#F8F9F9',
                            borderRadius: 9999,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: rf(7), color: '#1F2225', fontWeight: '700' }}>✓</Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={{
                          fontFamily: fontFamilies.spaceGrotesk.bold,
                          fontSize: rf(14),
                          lineHeight: rf(20),
                          color: '#1F2225',
                        }}
                      >
                        {owner.fullName}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text
                          style={{
                            fontFamily: fontFamilies.inter.bold,
                            fontSize: rf(10),
                            lineHeight: rf(15),
                            color: 'rgba(44,48,52,0.6)',
                          }}
                        >
                          {isVerified ? 'Verified Guide' : 'Member'}
                        </Text>
                        {owner.ratingCount != null && (
                          <>
                            <View style={{ width: 4, height: 4, backgroundColor: '#CFD4D8', borderRadius: 9999 }} />
                            <Text
                              style={{
                                fontFamily: fontFamilies.inter.bold,
                                fontSize: rf(10),
                                lineHeight: rf(15),
                                color: 'rgba(44,48,52,0.6)',
                              }}
                            >
                              {owner.ratingCount} Rentals
                            </Text>
                          </>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <AppIcon name="flash" size={9} color={colors.signalLime} />
                        <Text
                          style={{
                            fontFamily: fontFamilies.ibmPlexMono.semiBold,
                            fontSize: rf(9),
                            lineHeight: rf(14),
                            textTransform: 'uppercase',
                            color: '#1F2225',
                          }}
                        >
                          Responds in 5m
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ── Description ── */}
            {gear?.description ? (
              <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 15 }}>
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: fontFamilies.spaceGrotesk.bold,
                      fontSize: rf(12),
                      lineHeight: rf(16),
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: '#1F2225',
                    }}
                  >
                    Description
                  </Text>
                  <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />
                </View>
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.regular,
                    fontSize: rf(14),
                    lineHeight: rf(23),
                    color: '#1F2225',
                  }}
                >
                  {gear.description}
                </Text>
              </View>
            ) : null}

            {/* ── Policies — icon rows with dividers, like the product screen ── */}
            {policies.length > 0 && (
              <View style={{ paddingHorizontal: spacing.xl, paddingTop: 24, gap: 16, paddingBottom: 8 }}>
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: fontFamilies.spaceGrotesk.bold,
                      fontSize: rf(12),
                      lineHeight: rf(16),
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      color: '#1F2225',
                    }}
                  >
                    Platform Policies
                  </Text>
                  <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />
                </View>
                <View
                  style={{
                    backgroundColor: '#F8F9F9',
                    borderWidth: 1,
                    borderColor: '#DDE1E3',
                    borderRadius: radius.card,
                    paddingHorizontal: spacing.lg,
                  }}
                >
                  {policies.map((policy, j) => (
                    <View
                      key={j}
                      style={{
                        flexDirection: 'row',
                        gap: 12,
                        paddingVertical: 12,
                        borderBottomWidth: j === policies.length - 1 ? 0 : 1,
                        borderBottomColor: '#ECEEEF',
                      }}
                    >
                      <View style={{ marginTop: 2 }}>
                        <Ionicons name="checkmark-circle-outline" size={15} color="#1F2225" />
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          fontFamily: fontFamilies.inter.regular,
                          fontSize: rf(11),
                          lineHeight: rf(16),
                          color: 'rgba(44,48,52,0.7)',
                        }}
                      >
                        {policy}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
