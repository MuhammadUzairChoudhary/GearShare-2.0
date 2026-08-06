import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { AlpineHeader } from '../components/navigation/AlpineHeader';

// AlpineHeader reads the top inset for its padding — stub it flat in tests.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function renderHeader(props: React.ComponentProps<typeof AlpineHeader>) {
  return render(
    <ThemeProvider>
      <AlpineHeader {...props} />
    </ThemeProvider>,
  );
}

describe('AlpineHeader', () => {
  it('renders the title and subtitle', () => {
    const { getByText } = renderHeader({ title: 'Marc Giroud', subtitle: 'Last online · 3 min ago' });
    expect(getByText('Marc Giroud')).toBeTruthy();
    expect(getByText('Last online · 3 min ago')).toBeTruthy();
  });

  it('stacks title above subtitle by default', () => {
    const { queryByTestId, getByText } = renderHeader({ title: 'Marc Giroud', subtitle: 'Online' });
    expect(getByText('Marc Giroud')).toBeTruthy();
    expect(getByText('Online')).toBeTruthy();
    // No inline row is rendered in the stacked layout.
    expect(queryByTestId('alpine-header-title-row')).toBeNull();
  });

  it('places title and subtitle on the same row when subtitleInline', () => {
    const { getByTestId, getByText } = renderHeader({
      title: 'Marc Giroud',
      subtitle: 'Last online · 3 min ago',
      subtitleInline: true,
    });
    expect(getByText('Marc Giroud')).toBeTruthy();
    expect(getByText('Last online · 3 min ago')).toBeTruthy();
    // Both texts share the single inline row beside the avatar.
    const row = getByTestId('alpine-header-title-row');
    const rowStyle = StyleSheet.flatten(row.props.style as ViewStyle);
    expect(rowStyle.flexDirection).toBe('row');
  });

  it('announces the title block as a profile button when onTitlePress is set', () => {
    const onTitlePress = jest.fn();
    const { getByRole } = renderHeader({ title: 'Marc Giroud', onTitlePress });
    expect(getByRole('button', { name: 'Marc Giroud. View profile' })).toBeTruthy();
  });
});
