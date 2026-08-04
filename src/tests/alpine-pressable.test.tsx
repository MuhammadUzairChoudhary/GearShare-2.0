import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { AlpinePressable } from '../components/ui/AlpinePressable';
import * as ExpoHaptics from 'expo-haptics';

const mockedExpoHaptics = ExpoHaptics as jest.Mocked<typeof ExpoHaptics>;

function renderPressable(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('AlpinePressable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children and fire onPress', () => {
    const onPress = jest.fn();
    const { getByText } = renderPressable(
      <AlpinePressable onPress={onPress}>
        <Text>Press me</Text>
      </AlpinePressable>,
    );
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not attach a press handler when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = renderPressable(
      <AlpinePressable onPress={onPress} disabled accessibilityLabel="Disabled action">
        <Text>Disabled</Text>
      </AlpinePressable>,
    );
    const host = getByRole('button', { disabled: true });
    // The press handler must be dropped at the host level when disabled.
    expect(host.props.onPress).toBeUndefined();
    expect(host.props.onPressIn).toBeUndefined();
    expect(host.props.onLongPress).toBeUndefined();
  });

  it('should expose disabled in the accessibility state', () => {
    const { getByRole } = renderPressable(
      <AlpinePressable onPress={() => {}} disabled accessibilityLabel="Action">
        <Text>X</Text>
      </AlpinePressable>,
    );
    expect(getByRole('button', { disabled: true })).toBeTruthy();
  });

  it('should fire a selection haptic when haptic=selection and pressed', () => {
    const { getByText } = renderPressable(
      <AlpinePressable onPress={() => {}} haptic="selection">
        <Text>Vibrate</Text>
      </AlpinePressable>,
    );
    fireEvent(getByText('Vibrate'), 'pressIn');
    expect(mockedExpoHaptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('should not fire a selection haptic when disabled', () => {
    const { getByText } = renderPressable(
      <AlpinePressable onPress={() => {}} haptic="selection" disabled>
        <Text>Quiet</Text>
      </AlpinePressable>,
    );
    fireEvent(getByText('Quiet'), 'pressIn');
    expect(mockedExpoHaptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('should not fire haptics by default (opt-in)', () => {
    const { getByText } = renderPressable(
      <AlpinePressable onPress={() => {}}>
        <Text>Plain</Text>
      </AlpinePressable>,
    );
    fireEvent(getByText('Plain'), 'pressIn');
    expect(mockedExpoHaptics.selectionAsync).not.toHaveBeenCalled();
    expect(mockedExpoHaptics.impactAsync).not.toHaveBeenCalled();
  });
});
