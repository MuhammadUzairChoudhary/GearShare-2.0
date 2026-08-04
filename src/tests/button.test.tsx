import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { AppButton } from '../components/ui/AppButton';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('AppButton', () => {
  it('should render with title', () => {
    const { getByText } = renderWithTheme(<AppButton title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(<AppButton title="Press Me" onPress={onPress} />);
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <AppButton title="Disabled" onPress={onPress} disabled />,
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should apply accessibility attributes', () => {
    const { getByRole } = renderWithTheme(
      <AppButton title="Accessible" onPress={() => {}} accessibilityLabel="Custom Label" />,
    );
    const button = getByRole('button', { name: 'Custom Label' });
    expect(button).toBeTruthy();
  });

  it('should have testID', () => {
    const { getByTestId } = renderWithTheme(
      <AppButton title="Test ID" onPress={() => {}} testID="my-button" />,
    );
    expect(getByTestId('my-button')).toBeTruthy();
  });

  it('should keep the label in the tree and block presses while loading', () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = renderWithTheme(
      <AppButton title="Submit Request" onPress={onPress} loading />,
    );
    // Label stays rendered (available to screen readers via the container label).
    expect(getByText('Submit Request')).toBeTruthy();
    // Busy state is exposed to assistive technology.
    expect(getByRole('button', { busy: true })).toBeTruthy();
    fireEvent.press(getByText('Submit Request'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should prevent duplicate submissions on rapid repeated presses', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <AppButton title="Submit" onPress={onPress} variant="primary" />,
    );
    const label = getByText('Submit');
    fireEvent.press(label);
    fireEvent.press(label);
    fireEvent.press(label);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should render the destructive variant as a button with the action label', () => {
    const { getByRole } = renderWithTheme(
      <AppButton title="Cancel Rental" onPress={() => {}} variant="destructive" />,
    );
    expect(getByRole('button', { name: 'Cancel Rental' })).toBeTruthy();
  });

  it('should render all supported sizes', () => {
    const { rerender, getByText } = renderWithTheme(
      <ThemeProvider>
        <AppButton title="S" onPress={() => {}} size="small" />
      </ThemeProvider>,
    );
    expect(getByText('S')).toBeTruthy();
    rerender(
      <ThemeProvider>
        <AppButton title="M" onPress={() => {}} size="medium" />
      </ThemeProvider>,
    );
    expect(getByText('M')).toBeTruthy();
    rerender(
      <ThemeProvider>
        <AppButton title="L" onPress={() => {}} size="large" />
      </ThemeProvider>,
    );
    expect(getByText('L')).toBeTruthy();
  });
});
