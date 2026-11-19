# GearShare

A peer-to-peer outdoor equipment rental application built with React Native (Expo) and Supabase.

## About

GearShare lets people rent outdoor gear directly from each other. Owners list equipment (camping, hiking, climbing, water sports, winter gear, and more) with photos, pricing, and availability. Renters browse and search the catalog, submit rental requests, coordinate pickup and return, and pay through the app. The experience is designed around trust-sensitive transactions: condition documentation at pickup and return, a clear rental lifecycle, in-app messaging between participants, reviews, and issue reporting for disputes.

The app runs in two modes:
- **Mock data mode** (`EXPO_PUBLIC_USE_MOCK_DATA=true`): built-in mock data for all features, so UI development proceeds without a backend.
- **Supabase mode** (`EXPO_PUBLIC_USE_MOCK_DATA=false`): real authentication, database, storage, and realtime updates via Supabase.

## Main Features

### Authentication
- Email/password and OAuth sign-in, registration, and email verification via Supabase Auth
- Session restoration on app launch
- Auth state tracked through `AuthProvider` context
- `RequireAuth` guards for actions that need a signed-in user (saving listings, messaging, rental requests, owner tools)
- Unauthenticated users can browse Discover

### Discovery & Search
- Browse equipment listings in a feed with images, name, availability, price, deposit, distance, and owner trust signals
- Search by keyword with filters (category, dates, price range, availability)
- Date-picker modal for selecting rental windows
- Empty states with actionable prompts ("Change Dates", "Increase Search Radius", "Clear Filters")

### Listing Management (Renters)
- View listing detail with equipment photos, description, pricing, availability, and owner info
- Save listings to a wishlist
- Submit a rental request with draft preservation across interruptions
- Track rental lifecycle through statuses: Request Sent → Confirmed → Pickup → Active → Return → Complete

### Listing Management (Owners)
- Owner dashboard to manage listings and track incoming rental requests
- Create new listings (gear item, photos, pricing, availability, deposit)
- Edit existing listings
- Accept or decline rental requests

### Rental Lifecycle
- Full status tracking with a `StatusRail` progress indicator (animated on state change)
- Pickup and return condition documentation with photos (`condition_records`, `condition_images`)
- Security deposit holds and release (abstracted for future Stripe integration)
- Rental cancellation flow with destructive confirmation dialog

### In-App Messaging
- Conversations tied to rentals (`chat/[rentalId]`)
- Realtime messaging between renter and owner
- Unread message badges on the Inbox tab

### Reviews & Ratings
- Ratings and text reviews for completed rentals
- Public read access; reviews creatable only for completed rentals

### Issue Reporting
- File issues/disputes against rentals (`issue/[issueId]`)
- Track issue status and resolution

### Profile & Account
- User profiles with renter/owner roles
- Profile picture upload (avatars storage bucket)
- View own and other users' profiles

### Payments
- `PaymentHandler` interface decouples payment logic from UI
- Mock payment handler for development; Stripe-ready integration path (payment intents, webhooks, payouts)
- Payment secrets never stored in the mobile app

### Data & Offline Resilience
- Repository pattern with Mock and Supabase implementations, swapped via `EXPO_PUBLIC_USE_MOCK_DATA`
- TanStack Query for server state (listings, searches, rentals, messages, profiles, reviews) with retries and cache invalidation
- Zustand for cross-screen client state (search drafts, rental request drafts, listing creation drafts)
- Draft persistence across failed submissions and app interruptions
- Retryable queries and duplicate-submission protection

### Design System (Alpine Instrument)
- Precision, premium, technical, minimal design language inspired by outdoor gear and technical instruments
- Color tokens: Carbon/Titanium neutrals with Signal Lime primary accent
- Typography: Space Grotesk (titles), Inter (body), IBM Plex Mono (monetary data, dates, IDs)
- Component library: AppButton, Card, Chip, ListingCard, RentalSummaryCard, StatusRail, BottomSheet, AlpineDialog, AlpineHeader, CustomTabBar, and more
- 44px+ touch targets, screen-reader labels, dynamic type support, reduced-motion support
- Interaction rules: 80ms press feedback, one primary action per screen, specific trust language, no confetti or decorative animation

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54), React 19 |
| Routing | Expo Router (file-based) |
| Language | TypeScript |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Storage, Edge Functions) |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Animations | Reanimated, Gesture Handler |
| Images | expo-image |
| Haptics | expo-haptics |
| Secure Storage | expo-secure-store |
| Fonts | @expo-google-fonts (Space Grotesk, Inter, IBM Plex Mono) |
| Testing | Jest + React Native Testing Library |
| Lint/Format | ESLint + Prettier |

## Project Structure

```
src/
├── app/                # Expo Router routes
│   ├── (auth)/         # Authentication screens (sign-in, register, verify)
│   ├── (tabs)/         # Main tab navigation (Discover, Rentals, Inbox, Account)
│   ├── listing/[listingId]   # Listing detail
│   ├── rental/[rentalId]     # Rental detail & request
│   ├── owner/          # Owner dashboard & listing management
│   ├── issue/[issueId]       # Issue reporting
│   ├── profile/[userId]      # User profiles
│   ├── search/         # Search results
│   └── chat/[rentalId]       # In-app messaging
├── components/         # Reusable components
│   ├── ui/             # Design system components
│   ├── feedback/       # Loading, error, empty states
│   ├── layout/         # Layout components
│   └── navigation/     # Navigation guards & headers
├── features/           # Feature modules (auth, discover, listings, rentals, messaging, owner, payments, reviews, issues)
├── services/           # External service integrations (supabase, payments, analytics, notifications, feedback)
├── repositories/       # Data access layer (Mock + Supabase implementations)
├── hooks/              # TanStack Query hooks
├── stores/             # Zustand client state
├── providers/          # App providers (Auth, Toast, Theme)
├── theme/              # Design tokens & theming (Alpine Instrument)
├── types/              # TypeScript domain types
├── schemas/            # Zod validation schemas
├── constants/          # App constants
├── utils/              # Utility functions
├── mocks/              # Mock data
└── tests/              # Test files
```

## Requirements

- Node.js >= 22
- npm >= 10
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Supabase account (for backend features)

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in your Supabase credentials in .env
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://placeholder.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | `placeholder-key` |
| `EXPO_PUBLIC_APP_ENV` | Environment (`development`, `preview`, `production`) | `development` |
| `EXPO_PUBLIC_USE_MOCK_DATA` | Use mock data instead of Supabase (`true`/`false`) | `true` |

By default, the app runs with `EXPO_PUBLIC_USE_MOCK_DATA=true`, which uses built-in mock data for UI development without backend dependencies.

## Running

```bash
# Start the Expo development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## Mock Data Mode

When `EXPO_PUBLIC_USE_MOCK_DATA=true`, the app uses local mock data for all features:
- Discovery feed with sample listings
- Rental history with various statuses
- Messaging between users
- Profile management

This allows UI development to proceed independently of backend implementation.

## Supabase Setup

1. Create a Supabase project
2. Run migrations from `supabase/migrations/`
3. Configure authentication providers in Supabase dashboard
4. Set up storage buckets for images (`listing-images`, `condition-images`, `avatars`)
5. Update `.env` with your Supabase credentials
6. Set `EXPO_PUBLIC_USE_MOCK_DATA=false`

## Backend

See `BACKEND.md` for Supabase schema, Row Level Security policies, storage buckets, and Edge Function documentation.

## Design System & Interaction

See `DESIGN_SYSTEM.md` for Alpine Instrument design tokens and component documentation.

See `INTERACTION_SYSTEM.md` for the behavioral interaction specification (motion, buttons, forms, navigation, haptics, accessibility).

## Architecture

See `ARCHITECTURE.md` for detailed architectural decisions (separation of concerns, feature-oriented organization, repository pattern, state management boundaries, payment abstraction).

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm test` - Run tests
- `npm run format` - Format code with Prettier

## License

MIT