import React, { useCallback, useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Modal } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon } from '../../components/ui/Icons';
import { useTheme } from '../../theme/ThemeContext';
import { fontFamilies } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { rf } from '../../theme/responsiveFont';
import { useRental } from '../../hooks/useRentals';
import { useListing } from '../../hooks/useListings';
import { ROUTES } from '../../constants/routes';
import { formatMoney } from '../../utils/money';
import type { RentalStatus, Rental } from '../../types/rental';

const STATUS_STEPS: { label: string; key: string }[] = [
  { label: 'Request', key: 'req' },
  { label: 'Pickup', key: 'pick' },
  { label: 'Active', key: 'actv' },
  { label: 'Complete', key: 'done' },
];
const STEP_ICONS = ['document-text-outline', 'qr-code-outline', 'time-outline', 'checkmark-circle-outline'] as const;

function getActiveStep(status: RentalStatus): number {
  switch (status) {
    case 'request_sent':
    case 'waiting_for_owner':
    case 'action_required':
    case 'confirmed':
      return 0; // Request
    case 'pickup_due':
      return 1; // Pickup
    case 'active':
    case 'return_due':
    case 'under_review':
      return 2; // Active
    case 'completed':
      return 3; // Complete
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}

function getSubStatusForStep(stepIndex: number, status: RentalStatus): string {
  // Only show sub-status text for the active (current) step
  const activeStep = getActiveStep(status);
  if (stepIndex !== activeStep) return '';

  switch (stepIndex) {
    case 0: // Request
      return status === 'request_sent' ? 'Pending Approval' : 'Booking Confirmed';
    case 1: // Pickup
      return 'Ready for Pickup';
    case 2: // Active
      if (status === 'active') return 'In Use';
      if (status === 'return_due' || status === 'under_review') return 'Return Pending';
      return '';
    case 3: // Complete
      return 'Deposit Released';
    default:
      return '';
  }
}

// ── Demo phase flow ──────────────────────────────────────────────────────
const DEMO_PHASES: RentalStatus[] = ['request_sent', 'pickup_due', 'active', 'completed'];
const DEMO_CTA_LABELS = ['Cancel Request', 'Confirm Gear Received', 'Start Return', 'Submit Review'];

// ── Date/preset helpers for demo ──────────────────────────────────────────
const DAY_MS = 86400000;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HEADERS = ['S','M','T','W','T','F','S'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function RentalCalendar({ startDate, endDate, onStartChange, onEndChange, disabled }: {
  startDate: Date;
  endDate: Date;
  onStartChange: (d: Date) => void;
  onEndChange: (d: Date) => void;
  disabled: boolean;
}) {
  const [viewDate, setViewDate] = useState(new Date(startDate));
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getCalendarDays(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayPress = (day: number) => {
    if (disabled) return;
    const picked = new Date(year, month, day);
    const today = new Date(); today.setHours(0,0,0,0);
    if (picked < today) return;

    if (selecting === 'start') {
      onStartChange(picked);
      if (picked >= endDate) {
        const newEnd = new Date(picked);
        newEnd.setDate(newEnd.getDate() + 1);
        onEndChange(newEnd);
      }
      setSelecting('end');
    } else {
      if (picked <= startDate) {
        onStartChange(picked);
        setSelecting('end');
      } else {
        onEndChange(picked);
        setSelecting('start');
      }
    }
  };

  const isInRange = (day: number) => {
    const d = new Date(year, month, day);
    return d > startDate && d < endDate;
  };

  return (
    <View style={{ padding: 10 }}>
      {/* Month header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={prevMonth} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={16} color="#1F2225" />
        </TouchableOpacity>
        <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(13), lineHeight: rf(18), color: '#1F2225' }}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-forward" size={16} color="#1F2225" />
        </TouchableOpacity>
      </View>
      {/* Day headers */}
      <View style={{ flexDirection: 'row' }}>
        {DAY_HEADERS.map((h, j) => (
          <View key={j} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.5, color: 'rgba(44,48,52,0.4)' }}>{h}</Text>
          </View>
        ))}
      </View>
      {/* Day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((day, j) => {
          if (day === null) return <View key={`e-${j}`} style={{ width: `${100/7}%`, aspectRatio: 1 }} />;
          const d = new Date(year, month, day);
          const today = new Date(); today.setHours(0,0,0,0);
          const isPast = d < today;
          const isSelected = sameDay(d, startDate) || sameDay(d, endDate);
          const inRange = isInRange(day);

          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDayPress(day)}
              disabled={disabled || isPast}
              style={{
                width: `${100/7}%`,
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected ? '#1F2225' : inRange ? 'rgba(200,255,61,0.3)' : 'transparent',
                borderRadius: isSelected ? 6 : 0,
              }}
            >
              <Text style={{
                fontFamily: fontFamilies.inter.semiBold,
                fontSize: rf(12),
                lineHeight: rf(17),
                color: isSelected ? '#C8FF3D' : isPast ? 'rgba(44,48,52,0.25)' : '#1F2225',
              }}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, backgroundColor: '#1F2225', borderRadius: 2 }} />
          <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(8), lineHeight: rf(12), color: 'rgba(44,48,52,0.4)' }}>Selected</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, backgroundColor: 'rgba(200,255,61,0.3)', borderRadius: 2 }} />
          <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(8), lineHeight: rf(12), color: 'rgba(44,48,52,0.4)' }}>Range</Text>
        </View>
      </View>
    </View>
  );
}

export default function RentalDetailScreen() {
  const { rentalId, demo } = useLocalSearchParams<{ rentalId: string; demo?: string }>();
  const { colors } = useTheme();
  const isDemo = demo === 'true';
  const [demoPhase, setDemoPhase] = useState(0);
  const [demoRentalDays, setDemoRentalDays] = useState(3);
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const demoStatus = DEMO_PHASES[demoPhase] as RentalStatus;

  // ── Real rental query OR demo listing query ────────────────
  const {
    data: realRental,
    isLoading: rentalLoading,
    isError: rentalError,
    refetch: refetchRental,
  } = useRental(isDemo ? '' : rentalId ?? '');

  const {
    data: demoListing,
    isLoading: listingLoading,
    isError: listingError,
    refetch: refetchListing,
  } = useListing(isDemo ? rentalId ?? '' : '');

  // ── Derive dynamic dates for demo ──────────────────────────────
  const demoStartMs = Date.now() + DAY_MS * 2;
  const demoEndMs = demoStartMs + DAY_MS * demoRentalDays;
  const startDateStr = new Date(demoStartMs).toISOString();
  const endDateStr = new Date(demoEndMs).toISOString();
  const dailyPrice = demoListing?.dailyPrice ?? 32;
  const depositAmount = demoListing?.depositAmount ?? 350;
  const dynamicTotal = dailyPrice * demoRentalDays;

  const adjustDays = useCallback((delta: number) => {
    setDemoRentalDays(prev => Math.max(1, Math.min(14, prev + delta)));
  }, []);

  // ── Build the rental object ────────────────────────────────
  const rental: Rental | null | undefined = isDemo
    ? demoListing
      ? ({
          id: rentalId ?? 'GS-DEMO-001',
          listingId: rentalId ?? '',
          renterId: 'demo-renter',
          ownerId: 'demo-owner',
          startDate: startDateStr,
          endDate: endDateStr,
          pickupWindow: new Date(demoStartMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', 08:00 AM — 10:00 AM',
          returnWindow: null,
          intendedUse: null,
          rentalCharge: dynamicTotal,
          fees: 0,
          depositHold: depositAmount,
          status: demoStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          listing: demoListing,
          owner: demoListing?.owner,
        } satisfies Rental)
      : undefined
    : realRental;

  const isLoading = isDemo ? listingLoading : rentalLoading;
  const isError = isDemo ? listingError : rentalError;
  const refetch = isDemo ? refetchListing : refetchRental;

  // ── Auto-approve after 5s once request is sent ───────────────
  useEffect(() => {
    if (requestSent && isDemo && demoPhase === 0) {
      const timer = setTimeout(() => {
        setDemoPhase(prev => (prev < 3 ? prev + 1 : 0));
        setRequestSent(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [requestSent, isDemo, demoPhase]);

  const handleAdvancePhase = useCallback(() => {
    if (isDemo) {
      setDemoPhase(prev => (prev < 3 ? prev + 1 : 0));
    }
  }, [isDemo]);

  const handleMessageOwner = useCallback(() => {
    router.push(ROUTES.TABS.INBOX);
  }, []);

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.graphite300, opacity: 0.3 }} />
          <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(14), color: colors.textSecondary }}>
            Loading rental details...
          </Text>
        </View>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (isError || !rental) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.xxl, paddingTop: 48 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, backgroundColor: colors.background, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel="Go back"
          >
            <AppIcon name="back" size={14} color="#1F2225" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={{ fontFamily: fontFamilies.inter.medium, fontSize: rf(16), color: colors.textPrimary }}>Could not load rental</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ paddingHorizontal: 24, height: 44, backgroundColor: colors.carbon950, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(14), color: colors.white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const listing = rental.listing;
  const gear = listing?.gearItem;
  const owner = rental.owner;
  const rentalStatus = isDemo ? demoStatus : rental.status;
  const activeStep = getActiveStep(rentalStatus);
  const isCancelled = rentalStatus === 'cancelled';
  const daysDiff = Math.ceil(
    (new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / 86400000,
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header with blur backdrop + divider ──────────────────── */}
      <View style={{ padding: spacing.lg, paddingTop: 48, backgroundColor: 'rgba(255,255,255,0.8)', borderBottomWidth: 1, borderBottomColor: '#DDE1E3' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel="Go back"
          >
            <AppIcon name="back" size={14} color="#1F2225" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(18), lineHeight: rf(28), letterSpacing: -0.45, textTransform: 'uppercase', color: '#1F2225' }}>
            Rental Detail
          </Text>

          {/* Spacer to keep title centered (same width as back button for balance) */}
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════════════════════════════════════════════════════ */}
        {/* ── PRODUCT BANNER — single card shown above all phases ── */}
        {/* ════════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl }}>
          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 48, height: 48, backgroundColor: '#ECEEEF', borderRadius: 6 }}>
              <View style={{ flex: 1, backgroundColor: colors.graphite300, opacity: 0.2 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(18), textTransform: 'uppercase', color: '#1F2225' }} numberOfLines={1}>
                {gear?.name ?? 'Black Diamond Camalot C4 Set'}
              </Text>
              <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.6)', marginTop: 2 }}>{owner?.fullName ?? 'Marc Giroud'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowProductModal(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 32, backgroundColor: '#1F2225', borderRadius: 6 }}
            >
              <Ionicons name="eye-outline" size={14} color="white" />
              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(9), lineHeight: rf(14), letterSpacing: 0.9, textTransform: 'uppercase', color: 'white' }}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* ── VERTICAL TIMELINE — all 4 phases with icons and collapsible content ── */}
        {/* ════════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          {STATUS_STEPS.map((step, i) => {
            const isActive = i === activeStep && !isCancelled;
            const isPast = i < activeStep && !isCancelled;
            const subStatus = getSubStatusForStep(i, rentalStatus);
            const isLast = i === STATUS_STEPS.length - 1;
            const iconName: any = STEP_ICONS[i];

            return (
              <View key={step.key} style={{ flexDirection: 'row', minHeight: isActive ? undefined : 64 }}>
                {/* ── Timeline column (icon + connecting line) ── */}
                <View style={{ alignItems: 'center', width: 40 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isActive || isPast ? colors.signalLime : '#ECEEEF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Ionicons
                      name={iconName}
                      size={16}
                      color={isActive || isPast ? '#1F2225' : 'rgba(74,78,84,0.4)'}
                    />
                  </View>
                  {!isLast && (
                    <View style={{
                      width: 2,
                      flex: 1,
                      minHeight: 32,
                      backgroundColor: isPast ? colors.signalLime : '#ECEEEF',
                    }} />
                  )}
                </View>

                {/* ── Step content column ── */}
                <View style={{ flex: 1, paddingBottom: isLast ? 0 : 20, paddingLeft: 12, paddingRight: 4 }}>
                  {/* Header row — tappable to collapse/expand active step */}
                  <TouchableOpacity
                    activeOpacity={isActive ? 0.6 : 1}
                    onPress={isActive ? () => setTimelineExpanded(!timelineExpanded) : undefined}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 4 }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontFamily: fontFamilies.spaceGrotesk.bold,
                        fontSize: rf(14),
                        lineHeight: rf(20),
                        letterSpacing: -0.3,
                        textTransform: 'uppercase',
                        color: isActive || isPast ? '#1F2225' : 'rgba(74,78,84,0.4)',
                      }}>
                        {step.label}
                      </Text>
                      {subStatus ? (
                        <Text style={{
                          fontFamily: fontFamilies.ibmPlexMono.semiBold,
                          fontSize: rf(8),
                          lineHeight: rf(12),
                          letterSpacing: 0.8,
                          textTransform: 'uppercase',
                          color: isActive ? '#1F2225' : 'rgba(74,78,84,0.4)',
                          marginTop: 1,
                        }}>
                          {subStatus}
                        </Text>
                      ) : null}
                    </View>
                    {isActive && (
                      <Ionicons name={timelineExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#1F2225" />
                    )}
                  </TouchableOpacity>

                  {/* ── Persistent CTA — only visible on the active phase ── */}
                  {isActive && (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={i === 0 ? (requestSent ? () => setRequestSent(false) : () => setRequestSent(true)) : handleAdvancePhase}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 12,
                        height: 44,
                        backgroundColor: i === 0 && !requestSent ? '#1F2225' : colors.signalLime,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{
                        fontFamily: fontFamilies.spaceGrotesk.bold,
                        fontSize: rf(11),
                        lineHeight: rf(16),
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: i === 0 && !requestSent ? 'white' : '#1F2225',
                      }}>
                        {i === 0 ? (requestSent ? 'Cancel Request' : 'Request Rental') : DEMO_CTA_LABELS[i]}
                      </Text>
                      {i === 0 && !requestSent ? (
                        <Ionicons name="send" size={10} color="white" />
                      ) : (
                        <Ionicons name="arrow-forward" size={10} color="#1F2225" />
                      )}
                    </TouchableOpacity>
                  )}

                  {/* ── Expanded content (only for active step, collapsible on tap) ── */}
                  {isActive && timelineExpanded && (
                    <View style={{ marginTop: 16, gap: 16 }}>
                      {/* ═══════════════════════════════════════════════════ */}
                      {/* STEP 0: REQUEST — flat professional layout */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {i === 0 && (
                        <>
                          {/* ── Status row ── */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 6, height: 6, backgroundColor: requestSent ? colors.signalLime : 'rgba(44,48,52,0.3)', borderRadius: 9999 }} />
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(12), lineHeight: rf(18), color: 'rgba(44,48,52,0.6)' }}>
                              {requestSent ? `Request Sent · ${owner?.fullName?.split(' ')[0] ?? 'Marc'} responds in 5m` : 'Set your dates below'}
                            </Text>
                          </View>

                          {/* ── Calendar overlay modal ── */}
                          <Modal
                            visible={showCalendar && !requestSent}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowCalendar(false)}
                          >
                            <TouchableOpacity
                              activeOpacity={1}
                              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}
                              onPress={() => setShowCalendar(false)}
                            >
                              <View
                                onStartShouldSetResponder={() => true}
                                style={{ width: '100%', maxWidth: 340, backgroundColor: colors.white, borderRadius: 12, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 }}
                              >
                                <RentalCalendar
                                  startDate={new Date(demoStartMs)}
                                  endDate={new Date(demoEndMs)}
                                  onStartChange={(d: Date) => {
                                    const diff = Math.round((demoEndMs - d.getTime()) / DAY_MS);
                                    setDemoRentalDays(Math.max(1, Math.min(14, diff)));
                                    setShowCalendar(false);
                                  }}
                                  onEndChange={(d: Date) => {
                                    const diff = Math.round((d.getTime() - demoStartMs) / DAY_MS);
                                    setDemoRentalDays(Math.max(1, Math.min(14, diff)));
                                    setShowCalendar(false);
                                  }}
                                  disabled={requestSent}
                                />
                              </View>
                            </TouchableOpacity>
                          </Modal>

                          {/* ── Dates field — tappable row with calendar icon ── */}
                          <TouchableOpacity
                            disabled={requestSent}
                            onPress={() => setShowCalendar(!showCalendar)}
                            activeOpacity={0.7}
                            style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                          >
                            <Ionicons name="calendar-outline" size={18} color={requestSent ? 'rgba(44,48,52,0.3)' : '#1F2225'} />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>DATES</Text>
                              <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(13), lineHeight: rf(18), color: requestSent ? 'rgba(44,48,52,0.4)' : '#1F2225', marginTop: 2 }}>
                                {fmtDate(startDateStr)} — {fmtDate(endDateStr)}
                              </Text>
                            </View>
                            {!requestSent && (
                              <Ionicons name="create-outline" size={16} color="rgba(44,48,52,0.4)" />
                            )}
                          </TouchableOpacity>



                          {/* ── Pricing card with deposit, divider, total ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            {/* Daily rate — prominent */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(26), lineHeight: rf(32), color: '#1F2225' }}>{formatMoney(dailyPrice)}</Text>
                              <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(16), letterSpacing: 0.9, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>/ DAY</Text>
                            </View>
                            {/* Deposit subtitle */}
                            <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), color: 'rgba(44,48,52,0.4)', marginTop: 2 }}>{formatMoney(depositAmount)} deposit hold</Text>
                            {/* Divider */}
                            <View style={{ height: 1, backgroundColor: '#ECEEEF', marginVertical: 8 }} />
                            {/* Total + reassurance */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(16), lineHeight: rf(22), color: '#1F2225' }}>{formatMoney(dynamicTotal)} TOTAL</Text>
                              {!requestSent ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <Ionicons name="lock-closed-outline" size={11} color="rgba(44,48,52,0.4)" />
                                  <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)' }}>Charged at pickup</Text>
                                </View>
                              ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.signalLime, borderRadius: 4 }}>
                                  <Ionicons name="checkmark-circle" size={10} color="#1F2225" />
                                  <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(8), lineHeight: rf(12), color: '#1F2225' }}>Auto-approving</Text>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* ── Message owner ── */}
                          <TouchableOpacity onPress={handleMessageOwner} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Ionicons name="chatbubble-outline" size={14} color="rgba(44,48,52,0.4)" />
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.6)' }}>Message {owner?.fullName ?? 'Owner'}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={12} color="rgba(44,48,52,0.3)" />
                          </TouchableOpacity>
                        </>
                      )}

                      {/* ═══════════════════════════════════════════════════ */}
                      {/* STEP 1: PICKUP — flat professional layout */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {i === 1 && (
                        <>
                          {/* ── Status row + SLA ── */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 8, height: 8, backgroundColor: colors.signalLime, borderRadius: 9999 }} />
                            <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 1, textTransform: 'uppercase', color: '#1F2225' }}>Booking Confirmed</Text>
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.4)' }}>· Pickup in {daysDiff} day{daysDiff !== 1 ? 's' : ''}</Text>
                          </View>

                          {/* ── Duration + Total + Deposit with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Dates</Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225', marginTop: 2 }}>
                                  {new Date(rental.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(rental.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.regular, fontSize: rf(8), lineHeight: rf(12), color: 'rgba(44,48,52,0.4)', marginTop: 1 }}>{daysDiff} FULL DAYS</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Total Paid</Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225', marginTop: 2 }}>{formatMoney(rental.rentalCharge + rental.fees)}</Text>
                                <View style={{ alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 1, backgroundColor: '#1F2225', borderRadius: 3, marginTop: 2 }}>
                                  <Text style={{ fontFamily: fontFamilies.ibmPlexMono.regular, fontSize: rf(7), lineHeight: rf(11), letterSpacing: 0.02, color: colors.signalLime }}>SETTLED</Text>
                                </View>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#1F2225', borderRadius: 6, marginTop: 10 }}>
                              <View>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Security Deposit Hold</Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(15), lineHeight: rf(20), color: colors.white, marginTop: 1 }}>{formatMoney(rental.depositHold)}</Text>
                              </View>
                              <AppIcon name="lock" size={12} color={colors.signalLime} />
                            </View>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── QR Verification with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, alignItems: 'center' }}>
                            <View style={{ width: 100, height: 100, backgroundColor: '#F8F9F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name="qr-code" size={56} color="#1F2225" />
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                              {['8', '8', '2', '1'].map((d, j) => (
                                <View key={j} style={{ width: 36, height: 42, backgroundColor: '#1F2225', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(18), lineHeight: rf(24), color: colors.signalLime }}>{d}</Text>
                                </View>
                              ))}
                            </View>
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.4)', marginTop: 8 }}>Show to host for scanning</Text>
                          </View>

                          {/* ── Pickup Logistics with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                              <AppIcon name="location" size={16} color="#1F2225" />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225' }}>{listing?.pickupArea ?? '128 Route des Gaillands, 74400 Chamonix'}</Text>
                                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 1 }}>{fmtDate(startDateStr)}, 08:00 AM – 10:00 AM</Text>
                                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 4 }}>Park at climber's lot. Silver Airstream.</Text>
                                <TouchableOpacity style={{ marginTop: 4 }}>
                                  <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(14), color: '#1F2225' }}>Get Directions →</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── Inspection Checklist with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(11), lineHeight: rf(15), textTransform: 'uppercase', color: '#1F2225' }}>Inspect with {owner?.fullName?.split(' ')[0] ?? 'Marc'}</Text>
                            {['Check all 6 cam lobes & spring action', 'Check slings for zero fraying or wear'].map((item, j) => (
                              <TouchableOpacity key={j} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <View style={{ width: 18, height: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                  <Ionicons name="checkmark" size={12} color="transparent" />
                                </View>
                                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.7)' }}>{item}</Text>
                              </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#F8F9F9', borderRadius: 6, marginTop: 8 }}>
                              <Ionicons name="camera-outline" size={16} color="rgba(44,48,52,0.4)" />
                              <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)' }}>Snap condition photos</Text>
                            </TouchableOpacity>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── Financial Hold ── */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#F8F9F9', borderRadius: 6 }}>
                            <Ionicons name="lock-closed-outline" size={12} color="rgba(44,48,52,0.4)" />
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)' }}>{formatMoney(dynamicTotal)} charged · {formatMoney(depositAmount)} deposit hold active</Text>
                          </View>

                          {/* ── Message owner ── */}
                          <TouchableOpacity onPress={handleMessageOwner} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Ionicons name="chatbubble-outline" size={14} color="rgba(44,48,52,0.4)" />
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.6)' }}>Message {owner?.fullName ?? 'Owner'}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={11} color="rgba(44,48,52,0.3)" />
                          </TouchableOpacity>
                        </>
                      )}

                      {/* ═══════════════════════════════════════════════════ */}
                      {/* STEP 2: ACTIVE — flat professional layout */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {i === 2 && (
                        <>
                          {/* ── Dates/Total/Deposit with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Rental</Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225', marginTop: 2 }}>
                                  {new Date(rental.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(rental.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.regular, fontSize: rf(8), lineHeight: rf(12), color: 'rgba(44,48,52,0.4)', marginTop: 1 }}>{daysDiff} FULL DAYS</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Total Paid</Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225', marginTop: 2 }}>{formatMoney(rental.rentalCharge + rental.fees)}</Text>
                                <View style={{ alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 1, backgroundColor: '#1F2225', borderRadius: 3, marginTop: 2 }}>
                                  <Text style={{ fontFamily: fontFamilies.ibmPlexMono.regular, fontSize: rf(7), lineHeight: rf(11), letterSpacing: 0.02, color: colors.signalLime }}>SETTLED</Text>
                                </View>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#1F2225', borderRadius: 6, marginTop: 10 }}>
                              <View>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Security Deposit Hold</Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(15), lineHeight: rf(20), color: colors.white, marginTop: 1 }}>{formatMoney(rental.depositHold)}</Text>
                              </View>
                              <AppIcon name="lock" size={12} color={colors.signalLime} />
                            </View>
                          </View>

                          {/* ── Return Countdown (hero) ── */}
                          <View style={{ padding: 20, backgroundColor: '#1F2225', borderRadius: 10 }}>
                            <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Return Due In</Text>
                            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(30), lineHeight: rf(36), color: colors.signalLime, marginTop: 4 }}>{daysDiff} day{daysDiff !== 1 ? 's' : ''}</Text>
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(15), color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{new Date(rental.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} by 10:00 AM</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                              <AppIcon name="location" size={11} color={colors.signalLime} />
                              <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(255,255,255,0.6)' }}>{listing?.pickupArea ?? 'Same pickup location'}</Text>
                            </View>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── Return Checklist with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(11), lineHeight: rf(15), textTransform: 'uppercase', color: '#1F2225' }}>Return Checklist</Text>
                            {['Confirm returning all 6 cams', 'Check lobes & slings are in same condition', 'Snap drop-off photo'].map((item, j) => (
                              <TouchableOpacity key={j} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <View style={{ width: 18, height: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                  <Ionicons name="checkmark" size={12} color="transparent" />
                                </View>
                                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.7)' }}>{item}</Text>
                              </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#F8F9F9', borderRadius: 6, marginTop: 8 }}>
                              <Ionicons name="camera-outline" size={16} color="rgba(44,48,52,0.4)" />
                              <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)' }}>Upload drop-off photos</Text>
                            </TouchableOpacity>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── Quick Actions — flat list ── */}
                          <View style={{ gap: 0 }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ECEEEF' }}>
                              <Ionicons name="time-outline" size={16} color="#1F2225" />
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(11), lineHeight: rf(16), color: '#1F2225', flex: 1 }}>Request Extension</Text>
                              <Ionicons name="arrow-forward" size={12} color="rgba(44,48,52,0.3)" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleMessageOwner} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ECEEEF' }}>
                              <Ionicons name="chatbubble-outline" size={15} color="#1F2225" />
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(11), lineHeight: rf(16), color: '#1F2225', flex: 1 }}>Message Host</Text>
                              <Ionicons name="arrow-forward" size={12} color="rgba(44,48,52,0.3)" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
                              <Ionicons name="flag-outline" size={16} color="#EF4444" />
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(11), lineHeight: rf(16), color: '#EF4444', flex: 1 }}>Report Issue</Text>
                              <Ionicons name="arrow-forward" size={12} color="rgba(44,48,52,0.3)" />
                            </TouchableOpacity>
                          </View>
                        </>
                      )}

                      {/* ═══════════════════════════════════════════════════ */}
                      {/* STEP 3: COMPLETE — flat professional layout */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {i === 3 && (
                        <>
                          {/* ── Deposit Release (hero) ── */}
                          <View style={{ padding: 20, backgroundColor: '#1F2225', borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <View style={{ width: 24, height: 24, backgroundColor: 'rgba(200,255,61,0.2)', borderRadius: 9999, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="checkmark-circle" size={15} color={colors.signalLime} />
                              </View>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(17), lineHeight: rf(22), color: colors.signalLime }}>Rental Complete!</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                              <View>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Deposit Hold Released</Text>
                                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(22), lineHeight: rf(28), color: colors.signalLime, marginTop: 2 }}>{formatMoney(rental.depositHold)}</Text>
                              </View>
                              <Ionicons name="lock-open-outline" size={18} color={colors.signalLime} />
                            </View>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── Total/Dates/Owner with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(16), lineHeight: rf(22), color: '#1F2225' }}>{formatMoney(dynamicTotal)}</Text>
                              <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#1F2225', borderRadius: 4 }}>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.regular, fontSize: rf(7), lineHeight: rf(11), color: colors.signalLime }}>SETTLED</Text>
                              </View>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#ECEEEF', marginVertical: 8 }} />
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Rental Dates</Text>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225', marginTop: 2 }}>
                                  {new Date(rental.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(rental.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Owner</Text>
                                <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225', marginTop: 2 }}>{owner?.fullName ?? 'Marc Giroud'}</Text>
                              </View>
                            </View>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── Rating with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, alignItems: 'center' }}>
                            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(13), lineHeight: rf(18), color: '#1F2225', textAlign: 'center' }}>
                              Rate {owner?.fullName?.split(' ')[0] ?? 'Marc'}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} style={{ width: 36, height: 36, backgroundColor: '#F8F9F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={{ fontSize: rf(18), color: '#FACC15' }}>★</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.4)', marginTop: 8 }}>Tap a star to leave a review</Text>
                          </View>

                          {/* ── Divider ── */}
                          <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />

                          {/* ── Message owner ── */}
                          <TouchableOpacity onPress={handleMessageOwner} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Ionicons name="chatbubble-outline" size={14} color="rgba(44,48,52,0.4)" />
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.6)' }}>Message {owner?.fullName ?? 'Owner'}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={11} color="rgba(44,48,52,0.3)" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── PRODUCT DETAIL MODAL — bottom sheet with full gear info ── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProductModal}
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={{ flex: 1 }}>
          {/* Backdrop tap to close */}
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
            onPress={() => setShowProductModal(false)}
          />
          {/* Sheet content */}
          <View style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: 40,
            maxHeight: '85%',
          }}>
            {/* Drag handle */}
            <View style={{ width: 40, height: 4, backgroundColor: '#DDE1E3', borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg }} />

            {/* Close button */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(18), lineHeight: rf(26), letterSpacing: -0.45, textTransform: 'uppercase', color: '#1F2225' }}>
                {gear?.name ?? 'Product Details'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowProductModal(false)}
                style={{ width: 36, height: 36, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={14} color="#1F2225" />
              </TouchableOpacity>
            </View>

            {/* Scrollable content inside modal */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ── Image gallery ── */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg, marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 8 }}>
                {[1, 2, 3, 4].map((img, j) => (
                  <View key={j} style={{ width: 220, height: 150, backgroundColor: j === 0 ? '#DDE1E3' : '#ECEEEF', borderRadius: 8 }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="image-outline" size={28} color="rgba(44,48,52,0.25)" />
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* ── Hero section: Price + Rating side by side ── */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md }}>
                <View>
                  <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(24), lineHeight: rf(30), color: '#1F2225' }}>{formatMoney(dailyPrice)}</Text>
                  <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.9, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>PER DAY</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(15), lineHeight: rf(20), color: '#1F2225' }}>★ 4.9</Text>
                  <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.4)' }}>56 reviews</Text>
                </View>
              </View>

              {/* ── Section: Technical Specs ── */}
              <View style={{ backgroundColor: '#F8F9F9', borderRadius: 8, padding: 14, marginBottom: spacing.lg }}>
                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(10), lineHeight: rf(14), letterSpacing: 1, textTransform: 'uppercase', color: '#1F2225', marginBottom: 10 }}>Technical Specifications</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[
                    { label: 'WEIGHT', value: '1.28 KG' },
                    { label: 'SIZE RANGE', value: '0.3 – 4.0' },
                    { label: 'MATERIAL', value: 'Aluminum' },
                    { label: 'MFG YEAR', value: '2023' },
                    { label: 'CONDITION', value: 'Excellent' },
                    { label: 'SERIAL', value: 'BD-928-C4' },
                  ].map((spec, j) => (
                    <View key={j} style={{ width: '50%', paddingVertical: 6 }}>
                      <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(7), lineHeight: rf(11), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>{spec.label}</Text>
                      <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225', marginTop: 1 }}>{spec.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ── Section: About ── */}
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(10), lineHeight: rf(14), letterSpacing: 1, textTransform: 'uppercase', color: '#1F2225', marginBottom: 8 }}>Description</Text>
                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(13), lineHeight: rf(20), color: 'rgba(44,48,52,0.8)' }}>
                  Full set of Black Diamond Camalot C4s, ranging from #0.3 to #4. These are the latest model — 10% lighter than previous generations with a redesigned lobe for better grip and surface area contact.
                </Text>
              </View>

              {/* ── Section: Condition ── */}
              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(10), lineHeight: rf(14), letterSpacing: 1, textTransform: 'uppercase', color: '#1F2225', marginBottom: 8 }}>Gear Condition</Text>
              <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 14, backgroundColor: colors.white, marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 36, height: 36, backgroundColor: 'rgba(200,255,61,0.25)', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="checkmark-circle" size={18} color="#1F2225" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(12), lineHeight: rf(17), textTransform: 'uppercase', color: '#1F2225' }}>Excellent Condition</Text>
                    <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(15), color: 'rgba(44,48,52,0.5)', marginTop: 1 }}>
                      Minor cosmetic scratches on lobes. Slings are original with zero signs of wear.
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── Section: Owner ── */}
              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(10), lineHeight: rf(14), letterSpacing: 1, textTransform: 'uppercase', color: '#1F2225', marginBottom: 8 }}>Gear Owner</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg }}>
                <View style={{ width: 40, height: 40, backgroundColor: colors.graphite300, borderRadius: 9999 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(13), lineHeight: rf(18), color: '#1F2225' }}>{owner?.fullName ?? 'Marc Giroud'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                    <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.7, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Verified Guide</Text>
                    <View style={{ width: 3, height: 3, backgroundColor: '#CFD4D8', borderRadius: 9999 }} />
                    <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.7, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>120 Rentals</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 26, backgroundColor: '#F8F9F9', borderRadius: 4 }}>
                  <Ionicons name="flash" size={10} color={colors.signalLime} />
                  <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(7), lineHeight: rf(11), color: '#1F2225' }}>5m</Text>
                </View>
              </View>

              {/* ── Section: Policies ── */}
              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(10), lineHeight: rf(14), letterSpacing: 1, textTransform: 'uppercase', color: '#1F2225', marginBottom: 8 }}>Platform Policies</Text>
              <View style={{ backgroundColor: '#F8F9F9', borderRadius: 8, padding: 14, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#ECEEEF' }}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#1F2225" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), textTransform: 'uppercase', color: '#1F2225' }}>Damage Protection</Text>
                    <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(15), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>Renters are responsible for replacement costs of lost or non-functional equipment.</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, paddingTop: 12 }}>
                  <Ionicons name="close-circle-outline" size={16} color="#1F2225" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), textTransform: 'uppercase', color: '#1F2225' }}>Cancellation</Text>
                    <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(15), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>Free cancellation until 48h before pickup. 50% fee applies after.</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}
