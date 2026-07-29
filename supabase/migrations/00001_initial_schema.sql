-- GearShare Initial Schema
-- Migration 00001: Core domain tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  location TEXT,
  bio TEXT,
  is_renter BOOLEAN NOT NULL DEFAULT true,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'suspended')),
  rating_average NUMERIC(3,2),
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_verification ON profiles(verification_status);

-- ============================================================================
-- GEAR ITEMS
-- ============================================================================
CREATE TABLE gear_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL
    CHECK (category IN ('camping','hiking','climbing','cycling','water_sports','winter_sports','fishing','skiing','snowboarding','kayaking','backpacking','other')),
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  description TEXT NOT NULL,
  specifications JSONB,
  condition TEXT NOT NULL
    CHECK (condition IN ('new','like_new','good','fair','wear')),
  replacement_value INTEGER NOT NULL CHECK (replacement_value > 0),
  included_components TEXT[],
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','listed','rented','maintenance','retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_gear_items_owner ON gear_items(owner_id);
CREATE INDEX idx_gear_items_category ON gear_items(category);
CREATE INDEX idx_gear_items_status ON gear_items(status);

-- ============================================================================
-- LISTINGS
-- ============================================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gear_item_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daily_price INTEGER NOT NULL CHECK (daily_price > 0),
  deposit_amount INTEGER NOT NULL CHECK (deposit_amount >= 0),
  pickup_area TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available','unavailable','booked')),
  min_rental_duration INTEGER NOT NULL DEFAULT 1 CHECK (min_rental_duration > 0),
  policies TEXT[],
  published_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (published_status IN ('draft','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_listings_owner ON listings(owner_id);
CREATE INDEX idx_listings_gear_item ON listings(gear_item_id);
CREATE INDEX idx_listings_published ON listings(published_status) WHERE published_status = 'published';
CREATE INDEX idx_listings_availability ON listings(availability_status) WHERE availability_status = 'available';

-- ============================================================================
-- LISTING IMAGES
-- ============================================================================
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  image_type TEXT NOT NULL DEFAULT 'gallery'
    CHECK (image_type IN ('primary','gallery','condition')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);
CREATE INDEX idx_listing_images_primary ON listing_images(listing_id, sort_order);

-- ============================================================================
-- RENTALS
-- ============================================================================
CREATE TYPE rental_status AS ENUM (
  'request_sent',
  'waiting_for_owner',
  'action_required',
  'confirmed',
  'pickup_due',
  'active',
  'return_due',
  'under_review',
  'completed',
  'cancelled'
);

CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_window TEXT,
  return_window TEXT,
  intended_use TEXT,
  rental_charge INTEGER NOT NULL CHECK (rental_charge >= 0),
  fees INTEGER NOT NULL DEFAULT 0 CHECK (fees >= 0),
  deposit_hold INTEGER NOT NULL DEFAULT 0 CHECK (deposit_hold >= 0),
  status rental_status NOT NULL DEFAULT 'request_sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_rentals_renter ON rentals(renter_id);
CREATE INDEX idx_rentals_owner ON rentals(owner_id);
CREATE INDEX idx_rentals_listing ON rentals(listing_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);

-- ============================================================================
-- MESSAGES
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text','system','image','status_update')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_rental ON messages(rental_id);
CREATE INDEX idx_messages_created ON messages(rental_id, created_at);

-- ============================================================================
-- CONDITION RECORDS
-- ============================================================================
CREATE TABLE condition_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('pickup','return')),
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  confirmation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (confirmation_status IN ('pending','confirmed_by_renter','confirmed_by_owner','disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_condition_records_rental ON condition_records(rental_id);

-- ============================================================================
-- CONDITION IMAGES
-- ============================================================================
CREATE TABLE condition_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condition_record_id UUID NOT NULL REFERENCES condition_records(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_condition_images_record ON condition_images(condition_record_id);

-- ============================================================================
-- SAVED LISTINGS
-- ============================================================================
CREATE TABLE saved_listings (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

-- ============================================================================
-- REVIEWS
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rating JSONB NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_review_per_rental UNIQUE (rental_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewed_user ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);

-- ============================================================================
-- ISSUES
-- ============================================================================
CREATE TYPE issue_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
CREATE TYPE issue_resolution AS ENUM ('refund_renter', 'charge_renter', 'partial_refund', 'no_action', 'other');

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL
    CHECK (issue_type IN ('damage','not_returned','returned_late','wrong_item','quality','other')),
  description TEXT NOT NULL,
  status issue_status NOT NULL DEFAULT 'open',
  resolution issue_resolution,
  financial_adjustment INTEGER CHECK (financial_adjustment IS NULL OR financial_adjustment >= 0),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_issues_rental ON issues(rental_id);
CREATE INDEX idx_issues_status ON issues(status);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gear_items_updated_at
  BEFORE UPDATE ON gear_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at
  BEFORE UPDATE ON rentals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Profiles: users can read any profile, update own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Gear Items: owners manage own, others read listed items
CREATE POLICY "Anyone can view listed gear items"
  ON gear_items FOR SELECT
  USING (status IN ('available', 'listed') OR owner_id = auth.uid());

CREATE POLICY "Owners can insert gear items"
  ON gear_items FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their gear items"
  ON gear_items FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their gear items"
  ON gear_items FOR DELETE USING (owner_id = auth.uid());

-- Listings: anyone can read published, owners manage own
CREATE POLICY "Anyone can view published listings"
  ON listings FOR SELECT
  USING (published_status = 'published' OR owner_id = auth.uid());

CREATE POLICY "Owners can create listings"
  ON listings FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their listings"
  ON listings FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their listings"
  ON listings FOR DELETE USING (owner_id = auth.uid());

-- Listing Images: viewable with listing, owners manage
CREATE POLICY "Listing images viewable with listing"
  ON listing_images FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id)
  );

CREATE POLICY "Owners can manage listing images"
  ON listing_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND owner_id = auth.uid())
  );

-- Rentals: participants only
CREATE POLICY "Participants can view rentals"
  ON rentals FOR SELECT
  USING (renter_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Renters can create rental requests"
  ON rentals FOR INSERT WITH CHECK (renter_id = auth.uid());

CREATE POLICY "Participants can update rentals"
  ON rentals FOR UPDATE USING (renter_id = auth.uid() OR owner_id = auth.uid());

-- Messages: rental participants
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = messages.rental_id
      AND (rentals.renter_id = auth.uid() OR rentals.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages as themselves"
  ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Condition Records: rental participants
CREATE POLICY "Participants can view condition records"
  ON condition_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = condition_records.rental_id
      AND (rentals.renter_id = auth.uid() OR rentals.owner_id = auth.uid())
    )
  );

CREATE POLICY "Participants can create condition records"
  ON condition_records FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = condition_records.rental_id
      AND (rentals.renter_id = auth.uid() OR rentals.owner_id = auth.uid())
    )
  );

-- Condition Images: via condition records
CREATE POLICY "Condition images viewable with record"
  ON condition_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM condition_records
      WHERE condition_records.id = condition_images.condition_record_id
    )
  );

-- Saved Listings: users manage own
CREATE POLICY "Users can view own saved listings"
  ON saved_listings FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can save listings"
  ON saved_listings FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove saved listings"
  ON saved_listings FOR DELETE USING (user_id = auth.uid());

-- Reviews: viewable by everyone, created for eligible rentals
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for completed rentals"
  ON reviews FOR INSERT WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = reviews.rental_id
      AND rentals.status = 'completed'
      AND (rentals.renter_id = auth.uid() OR rentals.owner_id != auth.uid())
    )
  );

-- Issues: involved users and authorized roles
CREATE POLICY "Participants can view issues"
  ON issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = issues.rental_id
      AND (rentals.renter_id = auth.uid() OR rentals.owner_id = auth.uid())
    )
  );

CREATE POLICY "Participants can create issues"
  ON issues FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('listing-images', 'listing-images', true),
  ('condition-images', 'condition-images', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('listing-images', 'condition-images', 'avatars'));

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('listing-images', 'condition-images', 'avatars')
    AND auth.role() = 'authenticated'
  );
