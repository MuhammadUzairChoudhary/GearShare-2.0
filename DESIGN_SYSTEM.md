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
| `AppButton` | Button with primary/secondary/ghost/danger variants |
| `IconButton` | Icon-only touch target (min 44px) |
| `TextInput` | Form input with label, error, hint states |
| `Card` | Container with pressable option |
| `Chip` | Category/filter badge with variants |
| `Divider` | Horizontal separator |
| `Avatar` | User avatar with image or initials |
| `MoneyText` | Monetary display with accessibility |
| `StatusBadge` | Status indicator with dot and label |
| `StatusRail` | Rental lifecycle progress indicator |
| `ListingCard` | Equipment listing card for discover feed |
| `RentalCard` | Rental summary card with status |
| `BottomSheet` | Modal bottom sheet shell |

## Interaction Rules

- Only one Signal Lime primary action per screen
- Touch targets minimum 44x44 px
- Active feedback on press (opacity/highlight)
- Loading states for async operations
- Disabled states at 50% opacity

## Motion Rules

- Transitions: 200-300ms ease-out
- Sheet presentation: slide up
- Toast: fade in + slide up
- Status changes: subtle transitions
- Respect `prefers-reduced-motion`

## Accessibility

- Minimum 44px touch targets
- screen-reader labels on all interactive elements
- Logical focus order
- Dynamic font size compatibility
- Sufficient color contrast (WCAG AA minimum)
- Error messages not communicated by color alone
- Accessible monetary descriptions
- All components have `testID` for testing
