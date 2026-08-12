import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { GearPreviewSheet } from '../components/ui/GearPreviewSheet';
import type { Listing } from '../types/listing';

const listing: Listing = {
  id: 'listing-1',
  gearItemId: 'gear-1',
  ownerId: 'user-1',
  dailyPrice: 2500,
  depositAmount: 54900,
  pickupArea: 'Portland, OR',
  availabilityStatus: 'available',
  minRentalDuration: 2,
  policies: ['No smoking', 'Dry before returning'],
  publishedStatus: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  gearItem: {
    id: 'gear-1',
    ownerId: 'user-1',
    category: 'camping',
    name: 'Big Agnes Copper Spur HV UL2',
    brand: 'Big Agnes',
    model: 'Copper Spur HV UL2',
    description: 'Ultralight 2-person backpacking tent.',
    specifications: { weight: '3 lb 2 oz', capacity: '2 person' },
    condition: 'like_new',
    replacementValue: 54900,
    includedComponents: ['Tent body'],
    status: 'listed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  owner: {
    id: 'user-1',
    fullName: 'Alex Morgan',
    avatarUrl: null,
    location: 'Portland, OR',
    bio: null,
    isRenter: true,
    isOwner: true,
    verificationStatus: 'verified',
    ratingAverage: 4.8,
    ratingCount: 24,
    lastActiveAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  images: [
    {
      id: 'img-1',
      listingId: 'listing-1',
      storagePath: 'https://example.com/tent.jpg',
      sortOrder: 0,
      imageType: 'primary',
      createdAt: new Date().toISOString(),
    },
  ],
};

function renderSheet(visible: boolean, current: Listing | null = listing) {
  return render(
    <ThemeProvider>
      <GearPreviewSheet visible={visible} listing={current} onClose={jest.fn()} />
    </ThemeProvider>,
  );
}

describe('GearPreviewSheet', () => {
  it('renders the product-screen structure from the listing', () => {
    const { getByText, queryByText } = renderSheet(true);
    expect(getByText(/Big Agnes Copper Spur HV UL2/)).toBeTruthy();
    // Pricing card mirrors the product screen — estimated total + deposit.
    expect(getByText('Estimated Total')).toBeTruthy();
    expect(getByText('Security Deposit')).toBeTruthy();
    expect(getByText('for 3 days')).toBeTruthy();
    expect(getByText(/weight/i)).toBeTruthy();
    expect(getByText('Like New')).toBeTruthy();
    expect(getByText('Alex Morgan')).toBeTruthy();
    expect(getByText('Verified Guide')).toBeTruthy();
    expect(getByText('No smoking')).toBeTruthy();
    expect(queryByText('Product Details')).toBeNull();
  });

  it('hides content entirely when not visible', () => {
    const { queryByText } = renderSheet(false);
    expect(queryByText('Estimated Total')).toBeNull();
    expect(queryByText(/Big Agnes Copper Spur HV UL2/)).toBeNull();
  });

  it('falls back to a generic title when there is no listing', () => {
    const { getByText } = renderSheet(true, null);
    expect(getByText('Product Details')).toBeTruthy();
  });
});
