import React, { useCallback, useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Modal, TextInput, Image } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon } from '../../components/ui/Icons';
import { BackButton } from '../../components/ui/BackButton';
import { AlpineDialog } from '../../components/ui/AlpineDialog';
import { GearPreviewSheet } from '../../components/ui/GearPreviewSheet';
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuTrigger,
  type OptionsMenuTriggerHandle,
} from '../../components/ui/OptionsMenu';
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
const DEMO_CTA_LABELS = ['Cancel Request', 'Scan to confirm pickup', 'Start Return', 'Submit Review'];

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

function RentalCalendar({ startDate, endDate, onSelectDate, onDone, disabled }: {
  startDate: Date;
  endDate: Date | null;
  onSelectDate: (d: Date) => void;
  onDone: () => void;
  disabled: boolean;
}) {
  const [viewDate, setViewDate] = useState(new Date(startDate));
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getCalendarDays(year, month);

  const prevMonth = () => { setViewDate(new Date(year, month - 1, 1)); setShowMonthPicker(false); };
  const nextMonth = () => { setViewDate(new Date(year, month + 1, 1)); setShowMonthPicker(false); };

  // Tap-to-select range: 1st tap = start, 2nd tap = end. Range state machine
  // (reset on tap after a complete range) lives in the parent's selectDate.
  const handleDayPress = (day: number) => {
    if (disabled) return;
    const picked = new Date(year, month, day);
    const today = new Date(); today.setHours(0,0,0,0);
    if (picked < today) return;
    onSelectDate(picked);
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const rangeDays = endDate ? Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS) + 1 : 0;
  const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={{ padding: 10 }}>
      {/* ── Instructional text ── */}
      <Text style={{
        fontFamily: fontFamilies.inter.regular,
        fontSize: rf(10),
        lineHeight: rf(14),
        color: 'rgba(44,48,52,0.5)',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        {endDate ? 'Tap a date to start a new selection' : 'Tap a date to set your end date'}
      </Text>

      {/* Month header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={prevMonth} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={16} color="#1F2225" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowMonthPicker(!showMonthPicker)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(13), lineHeight: rf(18), color: '#1F2225' }}>
            {MONTHS[month]} {year}
          </Text>
          <Ionicons name={showMonthPicker ? 'chevron-up' : 'chevron-down'} size={12} color="rgba(44,48,52,0.4)" />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextMonth} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-forward" size={16} color="#1F2225" />
        </TouchableOpacity>
      </View>

      {/* Quick month/year scroller */}
      {showMonthPicker && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8, padding: 8, backgroundColor: '#F8F9F9', borderRadius: 8 }}>
          {Array.from({ length: 12 }, (_, m) => {
            const isCurrent = m === month;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => { setViewDate(new Date(year, m, 1)); setShowMonthPicker(false); }}
                style={{ width: `${100/4}%`, paddingVertical: 6, alignItems: 'center', backgroundColor: isCurrent ? '#1F2225' : 'transparent', borderRadius: 4 }}
              >
                <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(14), color: isCurrent ? '#C8FF3D' : '#1F2225' }}>{MONTHS[m]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

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
          const isPast = d < today;
          const isStart = sameDay(d, startDate);
          const isEnd = endDate !== null && sameDay(d, endDate);
          const inRange = endDate !== null && d > startDate && d < endDate;

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
                backgroundColor: isStart || isEnd ? '#1F2225' : inRange ? 'rgba(200,255,61,0.3)' : 'transparent',
                borderTopLeftRadius: isStart ? 8 : 0,
                borderBottomLeftRadius: isStart ? 8 : 0,
                borderTopRightRadius: isEnd ? 8 : 0,
                borderBottomRightRadius: isEnd ? 8 : 0,
              }}
            >
              <Text style={{
                fontFamily: fontFamilies.inter.semiBold,
                fontSize: rf(12),
                lineHeight: rf(17),
                color: isStart || isEnd ? '#C8FF3D' : isPast ? 'rgba(44,48,52,0.25)' : '#1F2225',
              }}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary bar + Done button */}
      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ECEEEF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }} numberOfLines={1}>
            {endDate ? `${fmtShort(startDate)} — ${fmtShort(endDate)}` : fmtShort(startDate)}
          </Text>
          <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)', marginTop: 1 }} numberOfLines={1}>
            {endDate ? `${rangeDays} day${rangeDays !== 1 ? 's' : ''} selected` : 'Tap again to set your end date'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDone}
          disabled={disabled}
          style={{ paddingHorizontal: 20, height: 36, backgroundColor: '#1F2225', borderRadius: 6, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1 }}
        >
          <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(11), lineHeight: rf(16), letterSpacing: 0.5, textTransform: 'uppercase', color: 'white' }}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Pseudo-QR placeholder for the active phase — decorative, no scanning ──
function ReturnQrCode() {
  const size = 15;
  const cell = 9;
  // Deterministic pseudo-random fill for the data region
  const cells: boolean[] = [];
  let seed = 42;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 31 + 17) % 9973;
    cells.push(seed % 2 === 0);
  }
  // Classic QR finder: dark border + dark 3x3 center, light ring between.
  // Local coordinates are computed per finder origin so the ring stays aligned.
  const finderOn = (r: number, c: number) => {
    const lr = r >= size - 7 ? r - (size - 7) : r;
    const lc = c >= size - 7 ? c - (size - 7) : c;
    const border = lr === 0 || lr === 6 || lc === 0 || lc === 6;
    const center = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
    return border || center;
  };
  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: size * cell }}>
      {Array.from({ length: size * size }, (_, idx) => {
        const r = Math.floor(idx / size);
        const c = idx % size;
        const on = inFinder(r, c) ? finderOn(r, c) : cells[idx];
        return (
          <View
            key={idx}
            style={{ width: cell, height: cell, backgroundColor: on ? '#1F2225' : '#FFFFFF', borderWidth: 0.5, borderColor: '#F0F1F2' }}
          />
        );
      })}
    </View>
  );
}

export default function RentalDetailScreen() {
  const { rentalId, demo } = useLocalSearchParams<{ rentalId: string; demo?: string }>();
  const { colors } = useTheme();
  const isDemo = demo === 'true';
  const [demoPhase, setDemoPhase] = useState(0);
  // ── Demo rental range: 1st tap = start, 2nd tap = end ──
  // Seeded with a complete 3-day range so pricing shows immediately; the first
  // tap in the calendar resets it to a fresh start date.
  const [rentalRange, setRentalRange] = useState<{ start: Date; end: Date | null }>(() => {
    // Seeded ~4 days out so pickup is >48h away and cancellation is testable
    const start = new Date(Date.now() + DAY_MS * 4);
    start.setHours(0, 0, 0, 0);
    return { start, end: new Date(start.getTime() + DAY_MS * 2) };
  });
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showPlansMenu, setShowPlansMenu] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  // Vertical offset for the options dropdown — measured from the 3-dot button
  // in window coordinates, so safe-area insets + header padding are included.
  const [optionsAnchorTop, setOptionsAnchorTop] = useState(96);
  const optionsTriggerRef = React.useRef<OptionsMenuTriggerHandle>(null);
  const demoStatus = (cancelled ? 'cancelled' : DEMO_PHASES[demoPhase]) as RentalStatus;

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
  const demoStartMs = rentalRange.start.getTime();
  const demoEndMs = rentalRange.end ? rentalRange.end.getTime() : demoStartMs;
  // Pickup happens one day before the first rental day
  const demoPickupMs = demoStartMs - DAY_MS;
  const demoRentalDays = rentalRange.end
    ? Math.round((rentalRange.end.getTime() - rentalRange.start.getTime()) / DAY_MS) + 1
    : 1;
  const startDateStr = new Date(demoStartMs).toISOString();
  const endDateStr = new Date(demoEndMs).toISOString();
  const dailyPrice = demoListing?.dailyPrice ?? 32;
  const depositAmount = demoListing?.depositAmount ?? 350;
  const dynamicTotal = dailyPrice * demoRentalDays;

  // Tap-to-select range logic: 1st tap = start, 2nd tap = end. After a full
  // range is set, any new tap resets and becomes the fresh start date.
  const selectDate = useCallback((d: Date) => {
    setRentalRange(prev => {
      if (prev.end !== null) {
        // Range complete → reset, this tap becomes the new start
        return { start: d, end: null };
      }
      if (d.getTime() < prev.start.getTime()) {
        // Tapped before the start → treat as a fresh start
        return { start: d, end: null };
      }
      // Tap on/after the start → completes the span (equal = single day)
      return { start: prev.start, end: d };
    });
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
          pickupWindow: new Date(demoPickupMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', 08:00 AM — 10:00 AM',
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
    router.push(ROUTES.CHAT(rentalId ?? ''));
  }, [rentalId]);

  const handleCancelRental = useCallback(() => {
    setShowOptionsMenu(false);
    setShowCancelDialog(true);
  }, []);

  const handleOpenOptions = useCallback(() => {
    setOptionsAnchorTop(optionsTriggerRef.current?.getAnchorTop() ?? 96);
    setShowOptionsMenu(true);
  }, []);

  const confirmCancelRental = useCallback(() => {
    setShowCancelDialog(false);
    setCancelled(true);
    setRequestSent(false);
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
          <BackButton />
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
  const daysDiff = isDemo
    ? demoRentalDays
    : Math.ceil(
        (new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / 86400000,
      );

  // ── Cancellation eligibility: free cancellation until 48h before pickup ──
  const pickupMs = isDemo
    ? demoPickupMs
    : new Date(rental.pickupWindow?.split(' — ')[0] ?? rental.startDate).getTime();
  const cancelDeadlineMs = pickupMs - 48 * 60 * 60 * 1000;
  const canCancelRental = !isCancelled && Date.now() < cancelDeadlineMs;

  // ── Request extension eligibility: only when more than 48h remain to return ──
  const returnMs = new Date(rental.endDate).getTime();
  const canRequestExtension = Date.now() < returnMs - 48 * 60 * 60 * 1000;
  // Rental details available once the request is submitted, throughout all steps.
  // Real (non-demo) rentals are only viewable here once submitted, so always show.
  const rentalStarted = !isDemo || requestSent || activeStep >= 1 || isCancelled;
  // Cancel available after submission until pickup, with the 48h-before-pickup rule
  const canShowCancelOption = rentalStarted && canCancelRental && activeStep <= 1;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header with blur backdrop + divider ──────────────────── */}
      <View style={{ padding: spacing.lg, paddingTop: 48, backgroundColor: 'rgba(255,255,255,0.8)', borderBottomWidth: 1, borderBottomColor: '#DDE1E3' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Back button */}
          <BackButton />

          {/* Title */}
          <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(18), lineHeight: rf(28), letterSpacing: -0.45, textTransform: 'uppercase', color: '#1F2225' }}>
            Rental Detail
          </Text>

          {/* Options menu — ⋮ vertical dots open the dropdown (Rental Details / Cancel Rental) */}
          {rentalStarted ? (
            <OptionsMenuTrigger
              ref={optionsTriggerRef}
              onPress={handleOpenOptions}
              accessibilityLabel="Rental options"
              testID="rental-options-trigger"
            />
          ) : (
            <View style={{ width: 40, height: 40 }} />
          )}
        </View>
      </View>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cancelled banner — shown once the rental is cancelled ── */}
        {isCancelled && (
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
            <View style={{ padding: spacing.lg, backgroundColor: '#1F2225', borderRadius: 10, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: 'rgba(200,255,61,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={18} color={colors.signalLime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(15), lineHeight: rf(20), color: colors.white }}>Rental Cancelled</Text>
                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  No charge applied. Your deposit hold has been released.
                </Text>
              </View>
            </View>
          </View>
        )}

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
                {/* ── Timeline column (icon + connecting line) — completed steps are muted so the current phase stands out ── */}
                <View style={{ alignItems: 'center', width: 40 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isActive ? colors.signalLime : isPast ? 'rgba(200,255,61,0.35)' : '#ECEEEF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Ionicons
                      name={iconName}
                      size={16}
                      color={isActive ? '#1F2225' : isPast ? 'rgba(31,34,37,0.5)' : 'rgba(74,78,84,0.4)'}
                    />
                  </View>
                  {!isLast && (
                    <View style={{
                      width: 2,
                      flex: 1,
                      minHeight: 32,
                      backgroundColor: isPast ? 'rgba(200,255,61,0.35)' : '#ECEEEF',
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
                        color: isActive ? '#1F2225' : isPast ? 'rgba(74,78,84,0.5)' : 'rgba(74,78,84,0.4)',
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
                    <>
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
                          backgroundColor: i === 0 && !requestSent ? '#1F2225' : i === 0 && requestSent ? '#EF4444' : colors.signalLime,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{
                          fontFamily: fontFamilies.spaceGrotesk.bold,
                          fontSize: rf(11),
                          lineHeight: rf(16),
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          color: i === 0 ? 'white' : '#1F2225',
                        }}>
                          {i === 0 ? (requestSent ? 'Cancel Request' : 'Request Rental') : DEMO_CTA_LABELS[i]}
                        </Text>
                        {i === 0 ? (
                          requestSent ? (
                            <Ionicons name="close" size={12} color="white" />
                          ) : (
                            <Ionicons name="send" size={10} color="white" />
                          )
                        ) : (
                          <AppIcon name="chevron-right" size={10} color="#1F2225" />
                        )}
                      </TouchableOpacity>
                      {/* Auto-approving status — under the Cancel Request button */}
                      {i === 0 && requestSent && (
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 8 }}>
                          <Ionicons name="checkmark-circle" size={11} color={colors.signalLime} />
                          <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)' }}>
                            Auto-approving after 5s (demo)
                          </Text>
                        </View>
                      )}
                    </>
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
                                style={{ width: '100%', maxWidth: 340, backgroundColor: colors.white, borderRadius: radius.card, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 }}
                              >
                                <RentalCalendar
                                  startDate={rentalRange.start}
                                  endDate={rentalRange.end}
                                  onSelectDate={selectDate}
                                  onDone={() => setShowCalendar(false)}
                                  disabled={requestSent}
                                />
                              </View>
                            </TouchableOpacity>
                          </Modal>

                          {/* ── Dates field — text left-aligned, calendar icon (same as cancellation policy) on the right ── */}
                          <TouchableOpacity
                            disabled={requestSent}
                            onPress={() => setShowCalendar(!showCalendar)}
                            activeOpacity={0.7}
                            style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>DATES</Text>
                              <Text numberOfLines={1} style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(13), lineHeight: rf(18), color: requestSent ? 'rgba(44,48,52,0.4)' : '#1F2225', marginTop: 2 }}>
                                {rentalRange.end ? `${fmtDate(startDateStr)} — ${fmtDate(endDateStr)}` : fmtDate(startDateStr)}
                              </Text>
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>
                                ({demoRentalDays} day{demoRentalDays !== 1 ? 's' : ''})
                              </Text>
                            </View>
                            <AppIcon name="calendar" size={14} color={requestSent ? 'rgba(44,48,52,0.3)' : '#1F2225'} />
                          </TouchableOpacity>



                          {/* ── Pricing card — rent / deposit hold / total with right-aligned amounts ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            {/* Rent — daily rate left, amount right */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                              <Text numberOfLines={1} style={{ flex: 1, fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.5)' }}>{formatMoney(dailyPrice)} / day</Text>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(22), color: '#1F2225' }}>{formatMoney(dynamicTotal)}</Text>
                            </View>
                            {/* Deposit hold — label left, amount right */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                              <Text numberOfLines={1} style={{ flex: 1, fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.5)' }}>Deposit Hold</Text>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(22), color: '#1F2225' }}>{formatMoney(depositAmount)}</Text>
                            </View>
                            {/* Divider */}
                            <View style={{ height: 1, backgroundColor: '#ECEEEF', marginVertical: 8 }} />
                            {/* Total — label left, hero amount right */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(15), letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(44,48,52,0.5)' }}>Total</Text>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(16), lineHeight: rf(32), color: '#1F2225' }}>{formatMoney(dynamicTotal + depositAmount)}</Text>
                            </View>
                            {/* Charged at pickup — right-aligned */}
                            {!requestSent && (
                              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                <Ionicons name="lock-closed-outline" size={11} color="rgba(44,48,52,0.4)" />
                                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)' }}>Charged at pickup</Text>
                              </View>
                            )}
                          </View>

                          {/* ── Message owner card — picture + replies in + CTA ── */}
                          <TouchableOpacity
                            onPress={handleMessageOwner}
                            activeOpacity={0.8}
                            style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                          >
                            {/* Owner picture */}
                            <View style={{ width: 44, height: 44, borderRadius: 9999, backgroundColor: '#ECEEEF', overflow: 'hidden' }}>
                              <View style={{ flex: 1, backgroundColor: colors.graphite300, opacity: 0.25 }} />
                            </View>
                            {/* Name + replies in */}
                            <View style={{ flex: 1 }}>
                              <Text numberOfLines={1} style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(13), lineHeight: rf(18), color: '#1F2225' }}>
                                {owner?.fullName ?? 'Marc Giroud'}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                                <Ionicons name="flash" size={9} color={colors.signalLime} />
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>
                                  Replies in 5m
                                </Text>
                              </View>
                            </View>
                            {/* CTA — plain message icon, no background */}
                            <Ionicons name="chatbubble-outline" size={18} color="#1F2225" />
                          </TouchableOpacity>
                        </>
                      )}

                      {/* ═══════════════════════════════════════════════════ */}
                      {/* STEP 1: PICKUP — flat professional layout */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {i === 1 && (
                        <>
                          {/* ── Pickup date — one day before rental start ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 40, height: 40, backgroundColor: '#F8F9F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name="calendar-outline" size={18} color="#1F2225" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Pickup Date</Text>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(16), lineHeight: rf(22), color: '#1F2225', marginTop: 2 }}>
                                {new Date(demoPickupMs).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </Text>
                              <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>08:00 AM — 10:00 AM</Text>
                            </View>
                          </View>

                          {/* ── Pickup Location with border container ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, backgroundColor: colors.white }}>
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                              <View style={{ width: 40, height: 40, backgroundColor: '#F8F9F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="location-outline" size={18} color="#1F2225" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225' }}>{listing?.pickupArea ?? '128 Route des Gaillands, 74400 Chamonix'}</Text>
                                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 1 }}>Park at climber's lot. Silver Airstream.</Text>
                                <TouchableOpacity style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(14), color: '#1F2225', textDecorationLine: 'underline' }}>Get Directions</Text>
                                  <AppIcon name="chevron-right" size={6.25} color="#1F2225" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>

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
                          </View>

                          {/* ── Rental dates + total charged at pickup ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white }}>
                            <View style={{ flexDirection: 'column', gap: 12 }}>
                              <View>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Rental Dates</Text>
                                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(20), color: '#1F2225', marginTop: 2 }}>
                                  {fmtDate(startDateStr)} - {fmtDate(endDateStr)}
                                </Text>
                                <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>{daysDiff} FULL DAYS</Text>
                              </View>
                              {/* Divider between the two sections */}
                              <View style={{ height: 1, backgroundColor: '#ECEEEF' }} />
                              <View>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Charged at Pickup</Text>
                                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(18), lineHeight: rf(24), color: '#1F2225', marginTop: 2 }}>{formatMoney(dynamicTotal + depositAmount)}</Text>
                                <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>{formatMoney(dynamicTotal)} rent · {formatMoney(depositAmount)} hold</Text>
                              </View>
                            </View>
                          </View>
                        </>
                      )}

                      {/* ═══════════════════════════════════════════════════ */}
                      {/* STEP 2: ACTIVE — flat professional layout */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {i === 2 && (
                        <>
                          {/* ── Return date — exact date + days left ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 40, height: 40, backgroundColor: '#F8F9F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name="calendar-outline" size={18} color="#1F2225" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Return Date</Text>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(15), lineHeight: rf(21), color: '#1F2225', marginTop: 2 }}>
                                {new Date(rental.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </Text>
                              <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 1 }}>by 10:00 AM</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: colors.signalLime }} />
                                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(11), lineHeight: rf(15), color: '#1F2225' }}>{daysDiff} day{daysDiff !== 1 ? 's' : ''} left</Text>
                              </View>
                            </View>
                          </View>

                          {/* ── Security deposit — repaid on return ── */}
                          <View style={{ padding: 14, backgroundColor: '#1F2225', borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 40, height: 40, backgroundColor: '#F8F9F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name="lock-closed-outline" size={18} color="#1F2225" />
                            </View>
                            <View>
                              <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Security Deposit</Text>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(18), lineHeight: rf(24), color: colors.white, marginTop: 2 }}>{formatMoney(rental.depositHold)}</Text>
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Repaid on return</Text>
                            </View>
                          </View>

                          {/* ── QR code — owner scans at return (no CTA) ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, alignItems: 'center' }}>
                            <View style={{ alignSelf: 'stretch' }}>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(11), lineHeight: rf(15), textTransform: 'uppercase', color: '#1F2225' }}>Return QR</Text>
                              <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>Owner scans this on the return date</Text>
                            </View>
                            <View style={{ marginTop: 12, padding: 14, borderWidth: 1, borderColor: '#ECEEEF', borderRadius: 8, backgroundColor: colors.white, alignItems: 'center' }}>
                              {/* QR stays dimmed until the return date */}
                              <View style={{ opacity: 0.25 }}>
                                <ReturnQrCode />
                              </View>
                              <View style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Ionicons name="lock-closed-outline" size={15} color="rgba(44,48,52,0.45)" />
                                <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(9), lineHeight: rf(13), color: 'rgba(44,48,52,0.6)' }}>Will unlock on return date</Text>
                              </View>
                            </View>
                          </View>

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
                          </View>

                          {/* ── Change of plans? dropdown ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, backgroundColor: colors.white }}>
                            <TouchableOpacity
                              onPress={() => setShowPlansMenu(!showPlansMenu)}
                              activeOpacity={0.7}
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12 }}
                            >
                              <Ionicons name="swap-horizontal-outline" size={16} color="#1F2225" />
                              <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(11), lineHeight: rf(16), color: '#1F2225', flex: 1 }}>Change of plans?</Text>
                              <Ionicons name={showPlansMenu ? 'chevron-up' : 'chevron-down'} size={14} color="rgba(44,48,52,0.3)" />
                            </TouchableOpacity>
                            {showPlansMenu && (
                              <View style={{ gap: 6, padding: 8, borderTopWidth: 1, borderTopColor: '#ECEEEF', backgroundColor: '#F8F9F9', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: colors.white, borderRadius: 6 }}>
                                  <View style={{ width: 28, height: 28, backgroundColor: '#F0F1F2', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name="return-down-back-outline" size={14} color="#1F2225" />
                                  </View>
                                  <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(15), color: '#1F2225', flex: 1 }}>Return early</Text>
                                  <AppIcon name="chevron-right" size={6.25} color="rgba(44,48,52,0.3)" />
                                </TouchableOpacity>
                                {canRequestExtension && (
                                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: colors.white, borderRadius: 6 }}>
                                    <View style={{ width: 28, height: 28, backgroundColor: '#F0F1F2', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
                                      <Ionicons name="time-outline" size={14} color="#1F2225" />
                                    </View>
                                    <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(15), color: '#1F2225', flex: 1 }}>Request extension</Text>
                                    <AppIcon name="chevron-right" size={6.25} color="rgba(44,48,52,0.3)" />
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>

                          {/* ── Message owner card — same as request phase ── */}
                          <TouchableOpacity
                            onPress={handleMessageOwner}
                            activeOpacity={0.8}
                            style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                          >
                            {/* Owner picture */}
                            <View style={{ width: 44, height: 44, borderRadius: 9999, backgroundColor: '#ECEEEF', overflow: 'hidden' }}>
                              <View style={{ flex: 1, backgroundColor: colors.graphite300, opacity: 0.25 }} />
                            </View>
                            {/* Name + replies in */}
                            <View style={{ flex: 1 }}>
                              <Text numberOfLines={1} style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(13), lineHeight: rf(18), color: '#1F2225' }}>
                                {owner?.fullName ?? 'Marc Giroud'}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                                <Ionicons name="flash" size={9} color={colors.signalLime} />
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>
                                  Replies in 5m
                                </Text>
                              </View>
                            </View>
                            {/* CTA — plain message icon, no background */}
                            <Ionicons name="chatbubble-outline" size={18} color="#1F2225" />
                          </TouchableOpacity>

                          {/* ── Report Issue ── */}
                          <TouchableOpacity
                            activeOpacity={0.7}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 12 }}
                          >
                            <Ionicons name="flag-outline" size={16} color="#EF4444" />
                            <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(11), lineHeight: rf(16), color: '#EF4444', flex: 1 }}>Report Issue</Text>
                            <AppIcon name="chevron-right" size={6.25} color="rgba(44,48,52,0.3)" />
                          </TouchableOpacity>
                        </>
                      )}

                      {/* ═══════════════════════════════════════════════════ */}
                      {/* STEP 3: COMPLETE — flat professional layout */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {i === 3 && (
                        <>
                          {/* ── Rental complete card (white) ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 14, backgroundColor: colors.white }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <View style={{ width: 24, height: 24, backgroundColor: 'rgba(200,255,61,0.4)', borderRadius: 9999, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="checkmark-circle-outline" size={15} color="#1F2225" />
                              </View>
                              <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(17), lineHeight: rf(22), color: '#1F2225' }}>Rental Complete!</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#ECEEEF', marginVertical: 10 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <View>
                                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)' }}>Deposit Hold Released</Text>
                                <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(22), lineHeight: rf(28), color: '#1F2225', marginTop: 2 }}>{formatMoney(rental.depositHold)}</Text>
                              </View>
                              <Ionicons name="lock-open-outline" size={18} color="rgba(44,48,52,0.4)" />
                            </View>
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 8 }}>
                              Thanks for renting with GearShare — your deposit has been released.
                            </Text>
                          </View>

                          {/* ── Review box — rate the owner + write a review ── */}
                          <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 14, backgroundColor: colors.white }}>
                            <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(11), lineHeight: rf(15), textTransform: 'uppercase', color: '#1F2225' }}>Leave a Review</Text>
                            <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.5)', marginTop: 2 }}>
                              How was your rental with {owner?.fullName?.split(' ')[0] ?? 'Marc'}?
                            </Text>
                            {/* Rate stars — tap to select */}
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                  key={star}
                                  onPress={() => setReviewRating(star)}
                                  activeOpacity={0.7}
                                  style={{ width: 36, height: 36, backgroundColor: '#F8F9F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Text style={{ fontSize: rf(18), color: reviewRating >= star ? '#FACC15' : 'rgba(44,48,52,0.2)' }}>★</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            {/* Review text */}
                            <TextInput
                              value={reviewText}
                              onChangeText={setReviewText}
                              placeholder="Share your experience..."
                              placeholderTextColor="rgba(44,48,52,0.35)"
                              multiline
                              style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 10, minHeight: 80, marginTop: 12, fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: '#1F2225', textAlignVertical: 'top' }}
                            />
                          </View>
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
      {/* ── RENTAL DETAILS SHEET — gear preview + dates & amount ── */}
      {/* ── Rendered before the gear modal so the gear sheet stacks on top ── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRentalDetails}
        onRequestClose={() => setShowRentalDetails(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Backdrop tap to close */}
          <TouchableOpacity
            activeOpacity={1}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
            onPress={() => setShowRentalDetails(false)}
          />
          {/* Sheet content — full borderRadius with bottom corners zeroed for reliable rounding */}
          <View style={{
            backgroundColor: colors.background,
            borderRadius: radius.bottomSheet,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            overflow: 'hidden',
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: 40,
            height: '80%',
          }}>
            {/* Drag handle */}
            <View style={{ width: 40, height: 4, backgroundColor: '#DDE1E3', borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg }} />

            {/* Header + close */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: spacing.lg }}>
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(18), lineHeight: rf(26), letterSpacing: -0.45, textTransform: 'uppercase', color: '#1F2225' }}>
                Rental Details
              </Text>
              <TouchableOpacity
                onPress={() => setShowRentalDetails(false)}
                style={{ width: 36, height: 36, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={14} color="#1F2225" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ── Gear preview card — tap to open the full gear sheet on top ── */}
              <TouchableOpacity
                onPress={() => setShowProductModal(true)}
                activeOpacity={0.8}
                style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: spacing.lg }}
              >
                {listing?.images?.[0]?.storagePath ? (
                  <Image
                    source={{ uri: listing.images[0].storagePath }}
                    style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#ECEEEF' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: 48, height: 48, backgroundColor: '#ECEEEF', borderRadius: 6 }}>
                    <View style={{ flex: 1, backgroundColor: colors.graphite300, opacity: 0.2 }} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(14), lineHeight: rf(18), textTransform: 'uppercase', color: '#1F2225' }} numberOfLines={1}>
                    {gear?.name ?? 'Black Diamond Camalot C4 Set'}
                  </Text>
                  <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.6)', marginTop: 2 }}>{owner?.fullName ?? 'Marc Giroud'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(44,48,52,0.3)" />
              </TouchableOpacity>

              {/* ── Rental info: dates & amount ── */}
              <View style={{ borderWidth: 1, borderColor: '#DDE1E3', borderRadius: 8, padding: 12, backgroundColor: colors.white }}>
                <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(8), lineHeight: rf(12), letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(44,48,52,0.4)', marginBottom: 8 }}>Rental Details</Text>
                {/* Dates */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.5)' }}>Dates</Text>
                  <Text style={{ fontFamily: fontFamilies.ibmPlexMono.semiBold, fontSize: rf(12), lineHeight: rf(17), color: '#1F2225' }}>
                    {fmtDate(rental.startDate)} — {fmtDate(rental.endDate)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(11), lineHeight: rf(16), color: 'rgba(44,48,52,0.5)' }}>Duration</Text>
                  <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(11), lineHeight: rf(16), color: '#1F2225' }}>
                    {daysDiff} day{daysDiff !== 1 ? 's' : ''}
                  </Text>
                </View>
                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#ECEEEF', marginVertical: 10 }} />
                {/* Total */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fontFamilies.inter.bold, fontSize: rf(11), lineHeight: rf(16), textTransform: 'uppercase', color: 'rgba(44,48,52,0.6)' }}>Total</Text>
                  <Text style={{ fontFamily: fontFamilies.spaceGrotesk.bold, fontSize: rf(18), lineHeight: rf(24), color: '#1F2225' }}>{formatMoney(rental.rentalCharge + rental.fees + rental.depositHold)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ fontFamily: fontFamilies.inter.regular, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.4)' }}>Deposit hold</Text>
                  <Text style={{ fontFamily: fontFamilies.inter.semiBold, fontSize: rf(10), lineHeight: rf(14), color: 'rgba(44,48,52,0.6)' }}>{formatMoney(rental.depositHold)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── GEAR PREVIEW SHEET — shared bottom sheet with full gear info ── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <GearPreviewSheet
        visible={showProductModal}
        listing={listing}
        onClose={() => setShowProductModal(false)}
        testID="product-preview-sheet"
      />

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── OPTIONS MENU — shared dropdown anchored under the 3-dot button ── */}
      {/* ════════════════════════════════════════════════════════════ */}
      <OptionsMenu
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        anchorTop={optionsAnchorTop}
        testID="rental-options-menu"
      >
        {/* ── Rental details — opens the rental details sheet ── */}
        <OptionsMenuItem
          icon={<AppIcon name="info" size={14} color="#1F2225" />}
          label="Rental Details"
          onPress={() => {
            setShowOptionsMenu(false);
            setShowRentalDetails(true);
          }}
          testID="rental-details-item"
        />

        {/* ── Cancel rental — only in the request phase and at least 48h before pickup ── */}
        {canShowCancelOption && (
          <OptionsMenuItem
            divider
            icon={<Ionicons name="close-circle-outline" size={14} color="#EF4444" />}
            label="Cancel Rental"
            onPress={handleCancelRental}
            destructive
            testID="cancel-rental-item"
          />
        )}
      </OptionsMenu>

      {/* ── Cancel rental confirmation — destructive, explains consequences ── */}
      <AlpineDialog
        visible={showCancelDialog}
        title="Cancel this rental?"
        message={
          isDemo
            ? 'You are more than 48 hours before pickup, so no charge applies and your deposit hold will be released.'
            : 'Cancel this rental request? No charge applies before pickup.'
        }
        confirmLabel="Cancel Rental"
        cancelLabel="Keep Rental"
        onConfirm={confirmCancelRental}
        onCancel={() => setShowCancelDialog(false)}
        destructive
        testID="cancel-rental-dialog"
      />
    </View>
  );
}
