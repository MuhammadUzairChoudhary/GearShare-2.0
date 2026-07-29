# GearShare

A peer-to-peer outdoor equipment rental application built with React Native (Expo) and Supabase.

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
4. Set up storage buckets for images
5. Update `.env` with your Supabase credentials
6. Set `EXPO_PUBLIC_USE_MOCK_DATA=false`

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

```
src/
├── app/                # Expo Router routes
│   ├── (auth)/         # Authentication screens
│   ├── (tabs)/         # Main tab screens
│   ├── listing/        # Listing detail
│   ├── rental/         # Rental detail
│   ├── owner/          # Owner dashboard
│   └── issue/          # Issue reporting
├── components/         # Reusable components
│   ├── ui/             # Design system components
│   ├── feedback/       # Loading, error, empty states
│   ├── layout/         # Layout components
│   └── navigation/     # Navigation guards
├── features/           # Feature modules
│   ├── auth/           # Authentication
│   ├── discover/       # Discovery & search
│   ├── listings/       # Listing management
│   ├── rentals/        # Rental management
│   ├── messaging/      # In-app messaging
│   ├── owner/          # Owner tools
│   ├── payments/       # Payment abstraction
│   ├── reviews/        # Review system
│   └── issues/         # Issue reporting
├── services/           # External service integrations
│   ├── supabase/       # Supabase client
│   ├── payments/       # Payment handler abstraction
│   ├── analytics/      # Analytics service
│   └── notifications/  # Notifications service
├── repositories/       # Data access layer
├── hooks/              # TanStack Query hooks
├── stores/             # Zustand client state
├── providers/          # App providers
├── theme/              # Design tokens & theming
├── types/              # TypeScript domain types
├── schemas/            # Zod validation schemas
├── constants/          # App constants
├── utils/              # Utility functions
├── mocks/              # Mock data
└── tests/              # Test files
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

## Architecture

See `ARCHITECTURE.md` for detailed architectural decisions.

## Backend

See `BACKEND.md` for Supabase schema and security documentation.

## Design System

See `DESIGN_SYSTEM.md` for Alpine Instrument design tokens and component documentation.
