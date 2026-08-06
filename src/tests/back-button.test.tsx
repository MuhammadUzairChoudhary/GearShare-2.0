import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeContext';
import { BackButton } from '../components/ui/BackButton';

const mockedRouter = router as jest.Mocked<typeof router>;

function renderButton(props: React.ComponentProps<typeof BackButton> = {}) {
  return render(
    <ThemeProvider>
      <BackButton {...props} />
    </ThemeProvider>,
  );
}

/** Calls AlpinePressable's style function and flattens the base (unpressed) style. */
function baseStyle(host: { props: { style: (state: { pressed: boolean }) => ViewStyle[] } }): ViewStyle {
  const resolved = host.props.style({ pressed: false });
  return StyleSheet.flatten(resolved[0]);
}

describe('BackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to router.back()', () => {
    const { getByLabelText } = renderButton();
    fireEvent.press(getByLabelText('Go back'));
    expect(mockedRouter.back).toHaveBeenCalledTimes(1);
  });

  it('fires the onPress override', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderButton({ onPress });
    fireEvent.press(getByLabelText('Go back'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockedRouter.back).not.toHaveBeenCalled();
  });

  it('default mode: solid surface + hairline (theme background)', () => {
    const { getByLabelText } = renderButton();
    const style = baseStyle(getByLabelText('Go back'));
    expect(style.borderWidth).toBe(1);
    expect(style.backgroundColor).toBe('#FFFFFF');
  });

  it('bare mode: no stroke and no fill of its own (flat non-white surface)', () => {
    const { getByLabelText } = renderButton({ bare: true });
    const style = baseStyle(getByLabelText('Go back'));
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toBe('transparent');
  });

  it('overContent mode: translucent fill + hairline (on an image)', () => {
    const { getByLabelText } = renderButton({ overContent: true });
    const style = baseStyle(getByLabelText('Go back'));
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe('#DDE1E3');
    expect(style.backgroundColor).toBe('rgba(255,255,255,0.9)');
  });

  it('is exposed as an accessible button with a label', () => {
    const { getByRole } = renderButton();
    expect(getByRole('button', { name: 'Go back' })).toBeTruthy();
  });
});
