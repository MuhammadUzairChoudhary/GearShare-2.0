-- GearShare Seed Data
-- For local development and testing

-- Note: Auth users must be created first via Supabase dashboard or API.
-- This seed assumes user IDs are known.

-- Sample profiles
INSERT INTO profiles (id, full_name, avatar_url, location, bio, is_renter, is_owner, verification_status, rating_average, rating_count)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alex Morgan', NULL, 'Portland, OR', 'Avid climber and weekend camper. I take great care of my gear.', true, true, 'verified', 4.8, 24),
  ('00000000-0000-0000-0000-000000000002', 'Jordan Lee', NULL, 'Bend, OR', 'Trail runner and mountain biker.', true, false, 'verified', 4.9, 12),
  ('00000000-0000-0000-0000-000000000003', 'Sam Rivera', NULL, 'Seattle, WA', 'Climbing instructor and gear enthusiast.', true, true, 'verified', 4.7, 8)
ON CONFLICT (id) DO NOTHING;

-- Sample gear items
INSERT INTO gear_items (id, owner_id, category, name, brand, model, description, condition, replacement_value, included_components, status)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'camping', 'Big Agnes Copper Spur HV UL2', 'Big Agnes', 'Copper Spur HV UL2', 'Ultralight 2-person backpacking tent. Perfect for thru-hikes and weekend trips.', 'like_new', 54900, ARRAY['Tent body', 'Rainfly', 'Poles', 'Stakes', 'Stuff sack'], 'listed'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'climbing', 'Black Diamond Camalot C4 #0.5-3 Set', 'Black Diamond', 'Camalot C4', 'Complete set of Camalot C4 cams from 0.5 to 3. Clean, well-maintained.', 'good', 65000, ARRAY['6 cams', 'Gear sling'], 'listed'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 'hiking', 'Osprey Atmos AG 65', 'Osprey', 'Atmos AG 65', '65L backpack with Anti-Gravity suspension system.', 'good', 27900, ARRAY['Backpack', 'Rain cover'], 'listed')
ON CONFLICT (id) DO NOTHING;

-- Sample listings
INSERT INTO listings (id, gear_item_id, owner_id, daily_price, deposit_amount, pickup_area, availability_status, min_rental_duration, policies, published_status)
VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 2500, 54900, 'Portland, OR - Alberta District', 'available', 2, ARRAY['No smoking', '24-hour cancellation notice'], 'published'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 4500, 65000, 'Portland, OR - Alberta District', 'available', 1, ARRAY['Must have climbing experience', 'Inspect gear before use'], 'published'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 1500, 27900, 'Seattle, WA - Capitol Hill', 'available', 1, ARRAY['Return clean and dry', 'Report damage immediately'], 'published')
ON CONFLICT (id) DO NOTHING;

-- Sample rentals
INSERT INTO rentals (id, listing_id, renter_id, owner_id, start_date, end_date, rental_charge, fees, deposit_hold, status, intended_use)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-08-15', '2026-08-18', 7500, 500, 54900, 'confirmed', 'Weekend backpacking trip in the Wallowas'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '2026-09-01', '2026-09-02', 9000, 600, 65000, 'active', 'Sport climbing at Smith Rock')
ON CONFLICT (id) DO NOTHING;

-- Sample messages
INSERT INTO messages (rental_id, sender_id, body, message_type)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000002', 'Hi! Is the tent available for August 15-18?', 'text'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'Yes, it is! I''ll confirm the booking.', 'text');
