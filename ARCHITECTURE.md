# GearShare Architecture

## Architectural Principles

1. **Separation of Concerns**: Routes only handle navigation. Business logic lives in hooks/repositories/services. UI components are presentational.
2. **Feature-Oriented**: Code is organized by feature domain, not by technical layer.
3. **Data Access Abstraction**: UI never imports Supabase directly. All data access goes through repositories.
4. **State Management Boundaries**:
   - Server state → TanStack Query
   - Cross-screen client state → Zustand
   - Screen-specific UI → Local component state
5. **Payment Abstraction**: Payment logic is behind a `PaymentHandler` interface, allowing Stripe integration later without touching UI.

## Routing

Expo Router with file-based routing under `src/app/`:

- `(auth)/` - Authentication flow (sign-in, register, verify)
- `(tabs)/` - Main tab navigation (Discover, Rentals, Inbox, Account)
- `listing/[listingId]` - Listing detail
- `rental/[rentalId]` - Rental detail/review
- `owner/` - Owner dashboard
- `owner/listing/new` - New listing creation
- `owner/listing/[listingId]` - Edit listing
- `issue/[issueId]` - Issue reporting

## State Management

### TanStack Query (Server State)
- Listings, searches, rentals, messages, profiles, reviews
- Server mutations with cache invalidation
- Configurable stale times per data type
- Automatic retry and error handling

### Zustand (Client State)
- `useSearchStore` - Draft search criteria (cross-screen)
- `useRentalDraftStore` - Unsubmitted rental request progress
- `useListingDraftStore` - Temporary listing-creation draft
- Never duplicate server data in Zustand stores

## Data Access Pattern

```
UI Components → Hooks (TanStack Query) → Repositories → Supabase/Mock
```

Repositories implement interfaces with both Mock and Supabase implementations. The repository factory (`getRepositories()`) selects the implementation based on `EXPO_PUBLIC_USE_MOCK_DATA`.

## Authentication Strategy

- Supabase Auth for authentication
- Session restoration via `initializeAuth()`
- Auth state tracked via `AuthProvider` context
- `RequireAuth` component guards authenticated actions
- Unauthenticated users can browse Discover
- Authentication required for: saving listings, messaging, rental requests, owner tools

## Theme System

Typed design tokens in `src/theme/`:
- Colors (Alpine Instrument palette)
- Typography (Space Grotesk, Inter, IBM Plex Mono)
- Spacing (4–64 scale)
- Radius (button, card, input, chip)
- Theme context with light/dark mode
- All components consume theme via `useTheme()` hook

## Payment Abstraction

The `PaymentHandler` interface in `src/types/payment.ts` defines the contract for payment operations. The mock implementation (`MockPaymentHandler`) allows development without real payment processing. When Stripe integration is ready, a `StripePaymentHandler` will implement the same interface.

Payment secrets are never placed in the mobile application.

## Major Technical Decisions

| Decision | Rationale |
|---|---|
| Expo over bare RN | Faster setup, OTA updates, managed native modules |
| Expo Router | File-based routing, deep linking support |
| Supabase | Integrated auth, database, storage, realtime |
| TanStack Query over Redux | Server-cache specialized, excellent React hooks |
| Zustand over Context | Minimal boilerplate, no provider nesting issues |
| Repository pattern | Swap mock/real data, testability |
| Feature folders | Scalable organization as app grows |
| Minor units for money | Avoids floating-point precision issues |
