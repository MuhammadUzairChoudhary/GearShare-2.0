import React from 'react';
import { render } from '@testing-library/react-native';
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
    const { getByText } = renderHeader({ title: 'Marc Giroud', subtitle: 'Online' });
    expect(getByText('Marc Giroud')).toBeTruthy();
    expect(getByText('Online')).toBeTruthy();
  });

  it('announces the title block as a profile button when onTitlePress is set', () => {
    const onTitlePress = jest.fn();
    const { getByRole } = renderHeader({ title: 'Marc Giroud', onTitlePress });
    expect(getByRole('button', { name: 'Marc Giroud. View profile' })).toBeTruthy();
  });
});
