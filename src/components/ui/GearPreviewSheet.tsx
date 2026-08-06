import React from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { Avatar } from './Avatar';
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

/**
 * Gear preview bottom sheet — the shared product detail shown from the rental
 * flow's "gear preview card" and the chat window's gear card.
 *
 * Fully data-driven from a Listing: real photos, price, specs, condition,
 * owner, description, and policies. Falls back gracefully when a section has
 * no data (no phantom placeholder content).
 */
export function GearPreviewSheet({ visible, listing, onClose, testID }: GearPreviewSheetProps) {
  const { colors } = useTheme();
  const gear = listing?.gearItem;
  const owner = listing?.owner;
  const images = listing?.images ?? [];
  const specs = gear?.specifications ? Object.entries(gear.specifications) : [];
  const policies = listing?.policies ?? [];
  const price = listing?.dailyPrice ?? 0;
  const rating = owner?.ratingAverage ?? 0;
  const ratingCount = owner?.ratingCount ?? 0;

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
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: 40,
            height: '75%',
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
              marginBottom: spacing.lg,
            }}
          />

          {/* Title + close */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: fontFamilies.spaceGrotesk.bold,
                fontSize: rf(18),
                lineHeight: rf(26),
                letterSpacing: -0.45,
                textTransform: 'uppercase',
                color: colors.textPrimary,
              }}
            >
              {gear?.name ?? 'Product Details'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: '#DDE1E3',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Close gear details"
            >
              <Ionicons name="close" size={14} color="#1F2225" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* ── Image gallery ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: spacing.lg, marginHorizontal: -spacing.xl }}
              contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 8 }}
            >
              {images.length > 0 ? (
                images.map((img) => (
                  <Image
                    key={img.id}
                    source={{ uri: img.storagePath }}
                    style={{
                      width: 220,
                      height: 150,
                      borderRadius: 8,
                      backgroundColor: '#ECEEEF',
                    }}
                    resizeMode="cover"
                    accessibilityRole="image"
                    accessibilityLabel="Gear photo"
                  />
                ))
              ) : (
                <View
                  style={{
                    width: 220,
                    height: 150,
                    backgroundColor: '#ECEEEF',
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="image-outline" size={28} color="rgba(44,48,52,0.25)" />
                </View>
              )}
            </ScrollView>

            {/* ── Price + rating ── */}
            <View
              style={{
                padding: spacing.lg,
                backgroundColor: '#F8F9F9',
                borderWidth: 1,
                borderColor: '#DDE1E3',
                borderRadius: radius.card,
                marginBottom: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View>
                  <Text
                    style={{
                      fontFamily: fontFamilies.spaceGrotesk.bold,
                      fontSize: rf(24),
                      lineHeight: rf(30),
                      color: '#1F2225',
                    }}
                  >
                    {formatMoney(price)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.bold,
                      fontSize: rf(8),
                      lineHeight: rf(12),
                      letterSpacing: 0.9,
                      textTransform: 'uppercase',
                      color: 'rgba(44,48,52,0.4)',
                    }}
                  >
                    PER DAY
                  </Text>
                </View>
                {rating > 0 && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(15), lineHeight: rf(20), color: '#1F2225' }}>
                      ★ {rating.toFixed(1)}
                    </Text>
                    <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.4)' }}>
                      {ratingCount} review{ratingCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Technical specifications ── */}
            {specs.length > 0 && (
              <View
                style={{
                  backgroundColor: '#F8F9F9',
                  borderWidth: 1,
                  borderColor: '#DDE1E3',
                  borderRadius: radius.card,
                  padding: spacing.lg,
                  marginBottom: spacing.lg,
                }}
              >
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
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {specs.map(([label, value], j) => (
                    <View key={j} style={{ width: '50%', paddingVertical: 6 }}>
                      <Text
                        style={{
                          fontFamily: fontFamilies.inter.bold,
                          fontSize: rf(7),
                          lineHeight: rf(11),
                          letterSpacing: 0.8,
                          textTransform: 'uppercase',
                          color: 'rgba(44,48,52,0.4)',
                        }}
                      >
                        {label.replace('_', ' ')}
                      </Text>
                      <Text
                        style={{
                          fontFamily: fontFamilies.ibmPlexMono.semiBold,
                          fontSize: rf(12),
                          lineHeight: rf(17),
                          color: '#1F2225',
                          marginTop: 1,
                        }}
                      >
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Gear condition ── */}
            {gear?.condition && (
              <>
                <Text
                  style={{
                    fontFamily: fontFamilies.spaceGrotesk.bold,
                    fontSize: rf(12),
                    lineHeight: rf(16),
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: '#1F2225',
                    marginBottom: 8,
                  }}
                >
                  Gear Condition
                </Text>
                <View
                  style={{
                    padding: spacing.lg,
                    backgroundColor: '#F8F9F9',
                    borderWidth: 1,
                    borderColor: '#DDE1E3',
                    borderRadius: radius.card,
                    marginBottom: spacing.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
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
                      <Ionicons name="checkmark-circle" size={24} color="#1F2225" />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
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
                          {gear.description.slice(0, 140)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* ── Gear owner ── */}
            {owner && (
              <>
                <Text
                  style={{
                    fontFamily: fontFamilies.spaceGrotesk.bold,
                    fontSize: rf(12),
                    lineHeight: rf(16),
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: '#1F2225',
                    marginBottom: 8,
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
                    marginBottom: spacing.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                    <Avatar uri={owner.avatarUrl} name={owner.fullName} size="md" />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(20), color: '#1F2225' }}
                      >
                        {owner.fullName}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), color: 'rgba(44,48,52,0.6)' }}>
                          {owner.verificationStatus === 'verified' ? 'Verified Guide' : 'Member'}
                        </Text>
                        {owner.ratingAverage != null && (
                          <>
                            <View style={{ width: 4, height: 4, backgroundColor: '#CFD4D8', borderRadius: 9999 }} />
                            <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), color: 'rgba(44,48,52,0.6)' }}>
                              ★ {owner.ratingAverage.toFixed(1)}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* ── Description ── */}
            {gear?.description ? (
              <>
                <View style={{ gap: 4, marginBottom: spacing.lg }}>
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
                    fontSize: rf(13),
                    lineHeight: rf(20),
                    color: 'rgba(44,48,52,0.8)',
                    marginBottom: spacing.lg,
                  }}
                >
                  {gear.description}
                </Text>
              </>
            ) : null}

            {/* ── Policies ── */}
            {policies.length > 0 && (
              <>
                <View style={{ gap: 4, marginBottom: 8 }}>
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
                    padding: spacing.lg,
                    marginBottom: 20,
                  }}
                >
                  {policies.map((policy, j) => (
                    <View
                      key={j}
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        paddingTop: j === 0 ? 0 : 12,
                        paddingBottom: j === policies.length - 1 ? 0 : 12,
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
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
