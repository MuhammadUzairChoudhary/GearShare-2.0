# GearShare Backend

## Why Supabase

Supabase provides:
- PostgreSQL database with Row Level Security
- Authentication (email/password, OAuth)
- Storage for equipment and condition images
- Realtime subscriptions for messaging and updates
- Edge Functions for trusted server-side operations
- Future: Stripe webhook handling

## Initial Schema

The database schema is defined in `supabase/migrations/00001_initial_schema.sql`.

### Tables

- **profiles** - User profiles with renter/owner roles
- **gear_items** - Equipment catalog
- **listings** - Rental listings with pricing and availability
- **listing_images** - Equipment photos
- **rentals** - Rental transactions with status tracking
- **messages** - In-app messaging
- **condition_records** - Pickup/return condition documentation
- **condition_images** - Condition documentation photos
- **saved_listings** - User wishlists
- **reviews** - Ratings and feedback
- **issues** - Dispute and issue reporting

All monetary amounts stored as integer minor units (cents).

### Rental Statuses

| User-Facing Label | Database Value |
|---|---|
| Request Sent | `request_sent` |
| Waiting for Owner | `waiting_for_owner` |
| Action Required | `action_required` |
| Confirmed | `confirmed` |
| Pickup Due | `pickup_due` |
| Active | `active` |
| Return Due | `return_due` |
| Under Review | `under_review` |
| Completed | `completed` |
| Cancelled | `cancelled` |

## RLS Strategy

Row Level Security is enabled on all tables. Policies follow least privilege:

- **Profiles**: Public read, self-update
- **Gear Items**: Public read for available/listed, owner full access
- **Listings**: Public read for published, owner full access
- **Rentals**: Participants only (renter or owner)
- **Messages**: Rental participants, sender authentication
- **Condition Records**: Rental participants
- **Saved Listings**: Self-managed
- **Reviews**: Public read, create for completed rentals only
- **Issues**: Participants and authorized roles

## Storage Buckets

- `listing-images` - Public, for equipment photos
- `condition-images` - Public, for condition documentation
- `avatars` - Public, for profile pictures

## Edge Function Responsibilities

Future Edge Functions will handle:
- Stripe payment intent creation
- Webhook signature verification
- Payout processing
- Admin operations
- Background tasks (reminders, status transitions)

## Future Stripe Integration

Stripe will handle:
- Rental payments (authorization, capture)
- Security deposit holds and release
- Refunds and partial refunds
- Owner payouts
- Payment webhooks for status updates

The payment abstraction (`PaymentHandler` interface) is already in place to decouple payment logic from UI components.
