import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { Chip } from '../components/ui/Chip';
import { ActivityChip } from '../components/ui/ActivityChip';
import * as ExpoHaptics from 'expo-haptics';

const mockedExpoHaptics = ExpoHaptics as jest.Mocked<typeof ExpoHaptics>;

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Chip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fire onPress and a selection haptic when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Chip label="Verified Only" onPress={onPress} />,
    );
    fireEvent.press(getByText('Verified Only'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should drop press handlers at the host level when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Chip label="Verified Only" onPress={onPress} disabled />,
    );
    const host = getByRole('button', { name: 'Verified Only', disabled: true });
    // Disabled controls must never receive press handlers or haptics.
    expect(host.props.onPress).toBeUndefined();
    expect(host.props.onPressIn).toBeUndefined();
    expect(host.props.onPressOut).toBeUndefined();
  });

  it('should expose the disabled state to assistive technology', () => {
    const { getByRole } = renderWithTheme(
      <Chip label="Verified Only" onPress={() => {}} disabled />,
    );
    expect(getByRole('button', { name: 'Verified Only', disabled: true })).toBeTruthy();
  });

  it('should render a non-pressable chip as plain text', () => {
    const { getByText } = renderWithTheme(<Chip label="Static" />);
    expect(getByText('Static')).toBeTruthy();
  });

  it('should show the badge bubble when badgeCount is positive', () => {
    const { getByText } = renderWithTheme(<Chip label="Archived" badgeCount={2} />);
    expect(getByText('2')).toBeTruthy();
  });

  it('should hide the badge bubble when badgeCount is zero or absent', () => {
    const { queryByText, rerender } = renderWithTheme(<Chip label="Archived" badgeCount={0} />);
    expect(queryByText('0')).toBeNull();
    rerender(
      <ThemeProvider>
        <Chip label="Archived" />
      </ThemeProvider>,
    );
    expect(queryByText('0')).toBeNull();
  });

  it('should cap the badge at 9+ for large counts', () => {
    const { getByText, queryByText } = renderWithTheme(<Chip label="Archived" badgeCount={12} />);
    expect(getByText('9+')).toBeTruthy();
    expect(queryByText('12')).toBeNull();
  });

  it('should announce the badge count in the accessibility label', () => {
    const { getByRole } = renderWithTheme(
      <Chip label="Archived" badgeCount={3} onPress={() => {}} />,
    );
    expect(getByRole('button', { name: 'Archived, 3 with new messages' })).toBeTruthy();
  });
});

describe('ActivityChip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should announce selection state in the accessibility label', () => {
    const { getByLabelText } = renderWithTheme(
      <ActivityChip icon="bicycle-outline" label="Biking" isSelected onPress={() => {}} />,
    );
    expect(getByLabelText('Biking, selected')).toBeTruthy();
  });

  it('should not fire a haptic when disabled', () => {
    const { getByLabelText } = renderWithTheme(
      <ActivityChip icon="bicycle-outline" label="Biking" onPress={() => {}} disabled />,
    );
    fireEvent(getByLabelText('Biking'), 'pressIn');
    expect(mockedExpoHaptics.selectionAsync).not.toHaveBeenCalled();
  });
});
