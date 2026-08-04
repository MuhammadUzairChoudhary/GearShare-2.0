import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { AlpineDialog } from '../components/ui/AlpineDialog';
import * as ExpoHaptics from 'expo-haptics';

const mockedExpoHaptics = ExpoHaptics as jest.Mocked<typeof ExpoHaptics>;

function renderDialog(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('AlpineDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title and message when visible', () => {
    const { getByText } = renderDialog(
      <AlpineDialog
        visible
        title="Cancel this rental?"
        message="No charge applies before pickup."
        confirmLabel="Cancel Rental"
        onConfirm={() => {}}
      />,
    );
    expect(getByText('Cancel this rental?')).toBeTruthy();
    expect(getByText('No charge applies before pickup.')).toBeTruthy();
  });

  it('should not render content when hidden', () => {
    const { queryByText } = renderDialog(
      <AlpineDialog
        visible={false}
        title="Cancel this rental?"
        message="No charge applies before pickup."
        confirmLabel="Cancel Rental"
        onConfirm={() => {}}
      />,
    );
    expect(queryByText('Cancel this rental?')).toBeNull();
  });

  it('should fire onConfirm with an explicit confirm label', () => {
    const onConfirm = jest.fn();
    const { getByText } = renderDialog(
      <AlpineDialog
        visible
        title="Cancel this rental?"
        message="No charge applies before pickup."
        confirmLabel="Cancel Rental"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );
    fireEvent.press(getByText('Cancel Rental'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should fire onCancel when the cancel action is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = renderDialog(
      <AlpineDialog
        visible
        title="Cancel this rental?"
        message="No charge applies before pickup."
        confirmLabel="Cancel Rental"
        cancelLabel="Keep Rental"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );
    fireEvent.press(getByText('Keep Rental'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should fire a warning haptic once when a destructive dialog opens', () => {
    renderDialog(
      <AlpineDialog
        visible
        destructive
        title="Cancel this rental?"
        message="No charge applies before pickup."
        confirmLabel="Cancel Rental"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(mockedExpoHaptics.notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('should not fire a warning haptic for a non-destructive dialog', () => {
    renderDialog(
      <AlpineDialog
        visible
        title="Return early?"
        message="Returning early ends the rental now."
        confirmLabel="Return Early"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(mockedExpoHaptics.notificationAsync).not.toHaveBeenCalledWith('warning');
  });

  it('should fire the warning haptic only once per open, even while open', () => {
    const { rerender, getByText } = renderDialog(
      <AlpineDialog
        visible
        destructive
        title="Cancel this rental?"
        message="No charge applies before pickup."
        confirmLabel="Cancel Rental"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(mockedExpoHaptics.notificationAsync).toHaveBeenCalledTimes(1);

    // A re-render while the dialog stays open must not re-animate or re-haptic.
    rerender(
      <ThemeProvider>
        <AlpineDialog
          visible
          destructive
          title="Cancel this rental?"
          message="Updated copy while open."
          confirmLabel="Cancel Rental"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </ThemeProvider>,
    );
    expect(mockedExpoHaptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(getByText('Updated copy while open.')).toBeTruthy();
  });

  it('should remain fully usable when reduced motion is enabled', () => {
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);
    const onConfirm = jest.fn();
    const { getByText } = renderDialog(
      <AlpineDialog
        visible
        destructive
        title="Cancel this rental?"
        message="No charge applies before pickup."
        confirmLabel="Cancel Rental"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );
    expect(getByText('Cancel this rental?')).toBeTruthy();
    fireEvent.press(getByText('Cancel Rental'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
