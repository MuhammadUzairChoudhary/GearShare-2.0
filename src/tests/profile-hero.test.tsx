import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { themeColors } from '../theme/colors';
import { ProfileHero } from '../components/ui/ProfileHero';

function renderHero(overrides: Record<string, unknown> = {}) {
  return render(
    <ThemeProvider>
      <ProfileHero
        name="Marc Giroud"
        verified
        location="Chamonix, FR"
        presence={{ label: 'Online', isOnline: true }}
        trustBadges={['Super Host']}
        rating={{ average: 4.9, count: 28 }}
        listingCount={4}
        {...overrides}
      />
    </ThemeProvider>,
  );
}

describe('ProfileHero', () => {
  it('should render identity, location, and presence', () => {
    const { getByText } = renderHero();
    expect(getByText('Marc Giroud')).toBeTruthy();
    expect(getByText('Chamonix, FR')).toBeTruthy();
    expect(getByText('Online')).toBeTruthy();
  });

  it('should render the stats row (rating, reviews, listings)', () => {
    const { getByText } = renderHero();
    expect(getByText('4.9')).toBeTruthy();
    expect(getByText('28')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('Rating')).toBeTruthy();
    expect(getByText('Reviews')).toBeTruthy();
    expect(getByText('Listings')).toBeTruthy();
  });

  it('should render trust badges as theme text and the member-since line', () => {
    const { getByText } = renderHero({ memberSince: 'March 2024' });
    expect(getByText('Super Host')).toBeTruthy();
    expect(getByText('Member since March 2024')).toBeTruthy();
  });

  it('should render the bio when present', () => {
    const { getByText } = renderHero({ bio: 'Alpine guide based in the valley.' });
    expect(getByText('Alpine guide based in the valley.')).toBeTruthy();
  });

  it('should show an em-dash rating when there is no rating data', () => {
    const { getByText } = renderHero({ rating: null });
    expect(getByText('—')).toBeTruthy();
  });

  it('should show a blue trust ring around verified avatars', () => {
    const { getByTestId } = renderHero();
    const ring = getByTestId('avatar-verified-ring');
    expect(ring.props.style).toEqual(
      expect.objectContaining({
        borderColor: themeColors.light.verified,
        borderWidth: 3,
      }),
    );
  });

  it('should not ring unverified avatars', () => {
    const { queryByTestId } = renderHero({ verified: false });
    expect(queryByTestId('avatar-verified-ring')).toBeNull();
  });
});
