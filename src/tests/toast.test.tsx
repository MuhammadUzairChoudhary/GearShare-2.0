import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { act, render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { ToastProvider, useToast } from '../providers/ToastProvider';

function Harness() {
  const { showToast } = useToast();
  const [count, setCount] = useState(0);
  return (
    <TouchableOpacity
      testID="fire"
      onPress={() => {
        setCount((c) => c + 1);
        showToast(`Toast message ${count}`, 'info');
      }}
    >
      <Text>Fire</Text>
    </TouchableOpacity>
  );
}

function renderWithToast(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <ToastProvider>{ui}</ToastProvider>
    </ThemeProvider>,
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Fake timers keep the auto-dismiss timeouts from leaking between tests.
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render a toast message after showToast', () => {
    const { getByTestId, getByText } = renderWithToast(<Harness />);
    fireEvent.press(getByTestId('fire'));
    expect(getByText('Toast message 0')).toBeTruthy();
  });

  it('should expose toasts as alerts for screen readers', () => {
    const { getByTestId, getByRole } = renderWithToast(<Harness />);
    fireEvent.press(getByTestId('fire'));
    expect(getByRole('alert')).toBeTruthy();
  });

  it('should render an action button that dismisses the toast', () => {
    const onUndo = jest.fn();
    function ActionHarness() {
      const { showToast } = useToast();
      return (
        <TouchableOpacity
          testID="fire"
          onPress={() =>
            showToast('Listing saved', 'info', {
              action: { label: 'Undo', onPress: onUndo },
            })
          }
        >
          <Text>Fire</Text>
        </TouchableOpacity>
      );
    }
    const { getByTestId, getByText, queryByText } = renderWithToast(<ActionHarness />);
    fireEvent.press(getByTestId('fire'));
    fireEvent.press(getByText('Undo'));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(queryByText('Listing saved')).toBeNull();
  });

  it('should cap the visible stack at three toasts', () => {
    const { getByTestId, queryAllByRole, queryByText, getByText } = renderWithToast(<Harness />);
    for (let i = 0; i < 4; i++) {
      fireEvent.press(getByTestId('fire'));
    }
    expect(queryAllByRole('alert')).toHaveLength(3);
    // "Toast message 0" is the oldest and must be trimmed.
    expect(queryByText('Toast message 0')).toBeNull();
    expect(getByText('Toast message 3')).toBeTruthy();
  });

  it('should auto-dismiss a toast after its visible duration', () => {
    jest.useFakeTimers();
    const { getByTestId, getByText, queryByText } = renderWithToast(<Harness />);
    fireEvent.press(getByTestId('fire'));
    expect(getByText('Toast message 0')).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(queryByText('Toast message 0')).toBeNull();
  });
});
