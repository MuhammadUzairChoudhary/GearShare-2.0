import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { IconButton } from '../components/ui/IconButton';

function renderButton(props: Partial<React.ComponentProps<typeof IconButton>> = {}) {
  return render(
    <ThemeProvider>
      <IconButton onPress={jest.fn()} accessibilityLabel="Action" {...props} />
    </ThemeProvider>,
  );
}

/** Calls AlpinePressable's style function and flattens the base (unpressed) style. */
function baseStyle(host: { props: { style: (state: { pressed: boolean }) => ViewStyle[] } }): ViewStyle {
  const resolved = host.props.style({ pressed: false });
  return StyleSheet.flatten(resolved[0]);
}

describe('IconButton', () => {
  it('default mode stays transparent with no stroke (generic IconButton)', () => {
    const { getByLabelText } = renderButton({ icon: 'trash' });
    const style = baseStyle(getByLabelText('Action'));
    expect(style.borderWidth).toBeUndefined();
    expect(style.backgroundColor).toBeUndefined();
  });

  it('bare mode: no stroke and no fill (flat non-white surface)', () => {
    const { getByLabelText } = renderButton({ icon: 'call', bare: true });
    const style = baseStyle(getByLabelText('Action'));
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toBe('transparent');
  });

  it('overContent mode: translucent fill + hairline (over an image)', () => {
    const { getByLabelText } = renderButton({ icon: 'call', overContent: true });
    const style = baseStyle(getByLabelText('Action'));
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe('#DDE1E3');
    expect(style.backgroundColor).toBe('rgba(255,255,255,0.9)');
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderButton({ icon: 'call', bare: true, onPress });
    fireEvent.press(getByLabelText('Action'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
