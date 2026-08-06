# Alpine Instrument Design System

## Philosophy

Alpine Instrument is precise, premium, technical, minimal, controlled, and highly legible. The design language draws from precision instruments, technical equipment, and outdoor gear — emphasizing clarity, durability, and purpose.

## Tokens

### Colors

| Token | Value | Usage |
|---|---|---|
| `carbon950` | `#0B0D0E` | Dark background |
| `carbon850` | `#171A1C` | Elevated surface |
| `titanium100` | `#ECEEEF` | Light border |
| `titanium50` | `#F8F9F9` | Light surface |
| `signalLime` | `#C8FF3D` | Primary accent |
| `signalLimeDark` | `#91C900` | Dark mode accent |
| `iceBlue` | `#69C8E8` | Info accent |
| `graphite700` | `#353A3D` | Dark neutral |
| `graphite500` | `#6F767A` | Mid neutral |
| `graphite300` | `#AEB4B7` | Light neutral |

Semantic colors: `success` (#73D98B), `warning` (#F2C94C), `error` (#FF6B65), `information` (#69C8E8).

### Typography

Three font families:

- **Space Grotesk**: Titles, product names, prices, important statuses
- **Inter**: Interface and body text
- **IBM Plex Mono**: Booking IDs, monetary data, dates, durations, measurements

### Spacing Scale

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

### Border Radius

| Context | Value |
|---|---|
| Button | 8 |
| Card | 10 |
| Input | 8 |
| Chip | 6 |
| Image | 10 |
| Bottom Sheet | 18 |

## Components

| Component | Description |
|---|---|
| `AppText` | Typography with variant/color/align props |
| `Screen` | Page layout with safe area and padding |
| `AppButton` | Button system: primary/secondary/tertiary/destructive/ghost, small/medium/large, loading + disabled states |
| `AlpinePressable` | Shared restrained pressable (scale ≤0.992, pressed styles, reduced-motion aware) |
| `IconButton` | Icon-only touch target (min 44px, pressed state, hit slop) |
| `TextInput` | Form input with label, required indicator, error, hint states |
| `Card` | Container with pressable option |
| `Chip` | Category/filter badge with variants and pressed/disabled states |
| `ActivityChip` | Icon + label filter chip with selected state |
| `Divider` | Horizontal separator |
| `Avatar` | User avatar with image or initials |
| `MoneyText` | Monetary display with accessibility |
| `StatusBadge` | Status indicator with dot and label |
| `StatusRail` | Rental lifecycle progress indicator (animates on state change) |
| `ListingCard` | Equipment listing card for discover feed |
| `RentalCard` | Rental summary card with status |
| `BottomSheet` | Modal bottom sheet with drag handle and controlled motion |
| `AlpineDialog` | Destructive/short-choice confirmation modal: controlled backdrop, error palette, warning haptic |
| `BackButton` | Standard back button — three surface modes: solid + hairline (theme background), `bare` (flat non-white surfaces: no stroke, no fill), `overContent` (translucent over imagery) |
| `AlpineHeader` | Reusable header: back, title/subtitle, trailing actions, solid/over-image/flat-surface (`bareBack`) states |
| `CustomTabBar` | Themed bottom tab bar with lime active rail, haptics, and badges |

## Interaction Rules

- Only one Signal Lime primary action per screen
- Touch targets minimum 44x44 px (buttons ≥52 px, icon buttons 44 px + hit slop)
- Press feedback is immediate (80 ms): scale ≤0.992, background emphasis, no bounce
- Disabled states use explicit muted palettes — never opacity alone
- Loading keeps button size and label; duplicates are blocked
- See `INTERACTION_SYSTEM.md` for the full behavioural spec

## Motion Tokens

Centralized in `src/theme/motion.ts`:

- Durations: instant 80 / fast 120 / standard 180 / deliberate 240 / completion 300 ms
- Easing: standard `[0.2,0,0,1]`, enter `[0.16,1,0.3,1]`, exit `[0.4,0,1,1]` (RN `Easing.bezier`)
- Press scale: 0.992 (cards), 0.985 (primary/destructive buttons), 1 px max translation
- Sheet presentation: 240 ms slide + backdrop fade; reduced motion = instant
- Toast: 180 ms enter / 120 ms exit, capped stack
- Status changes: 240 ms linear fill, short settle, no pulse
- Respect `prefers-reduced-motion` via `usePrefersReducedMotion()`

## Accessibility

- Minimum 44px touch targets
- screen-reader labels on all interactive elements
- Logical focus order
- Dynamic font size compatibility
- Sufficient color contrast (WCAG AA minimum)
- Error messages not communicated by color alone (status rail exposes a full description)
- Accessible monetary descriptions
- All components have `testID` for testing
