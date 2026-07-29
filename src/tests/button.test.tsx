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
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('should have testID', () => {
    const { getByTestId } = renderWithTheme(
      <AppButton title="Test ID" onPress={() => {}} testID="my-button" />,
    );
    expect(getByTestId('my-button')).toBeTruthy();
  });
});
