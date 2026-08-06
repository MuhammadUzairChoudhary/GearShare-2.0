import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { ViewStyle } from 'react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuTrigger,
  type OptionsMenuTriggerHandle,
} from '../components/ui/OptionsMenu';

function renderMenu(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

/** Recursive flatten — the RN mock's StyleSheet.flatten is identity, so arrays of styles need manual flattening. */
function flattenStyle(style: unknown): ViewStyle {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle));
  }
  return (style ?? {}) as ViewStyle;
}

describe('OptionsMenuTrigger', () => {
  it('fires onPress and exposes an accessible label', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderMenu(
      <OptionsMenuTrigger onPress={onPress} accessibilityLabel="Conversation options" />,
    );
    fireEvent.press(getByLabelText('Conversation options'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes getAnchorTop on the imperative handle (layout fallback)', () => {
    const ref = React.createRef<OptionsMenuTriggerHandle>();
    renderMenu(
      <OptionsMenuTrigger ref={ref} onPress={() => {}} accessibilityLabel="Rental options" />,
    );
    // No native measure in tests — falls back to the onLayout-derived anchor
    // (40px trigger + 8px gap), proving the handle is wired end to end.
    expect(ref.current?.getAnchorTop()).toBe(48);
  });

  it('bare mode: no stroke and no fill (flat non-white surface)', () => {
    const { getByLabelText } = renderMenu(
      <OptionsMenuTrigger bare onPress={jest.fn()} accessibilityLabel="Conversation options" />,
    );
    const host = getByLabelText('Conversation options');
    const resolved = host.props.style({ pressed: false });
    // Trigger passes an array of styles — flatten fully, then take the base.
    const style = flattenStyle(resolved[0]);
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toBe('transparent');
  });
});

describe('OptionsMenu', () => {
  it('renders items when visible', () => {
    const { getByText } = renderMenu(
      <OptionsMenu visible onClose={jest.fn()} anchorTop={96}>
        <OptionsMenuItem icon={null} label="View Profile" onPress={jest.fn()} />
        <OptionsMenuItem icon={null} label="Archive" onPress={jest.fn()} />
      </OptionsMenu>,
    );
    expect(getByText('View Profile')).toBeTruthy();
    expect(getByText('Archive')).toBeTruthy();
  });

  it('does not render items when hidden', () => {
    const { queryByText } = renderMenu(
      <OptionsMenu visible={false} onClose={jest.fn()} anchorTop={96}>
        <OptionsMenuItem icon={null} label="View Profile" onPress={jest.fn()} />
      </OptionsMenu>,
    );
    expect(queryByText('View Profile')).toBeNull();
  });

  it('fires each item onPress', () => {
    const onProfile = jest.fn();
    const onArchive = jest.fn();
    const { getByText } = renderMenu(
      <OptionsMenu visible onClose={jest.fn()} anchorTop={96}>
        <OptionsMenuItem icon={null} label="View Profile" onPress={onProfile} />
        <OptionsMenuItem icon={null} label="Archive" onPress={onArchive} />
      </OptionsMenu>,
    );
    fireEvent.press(getByText('View Profile'));
    fireEvent.press(getByText('Archive'));
    expect(onProfile).toHaveBeenCalledTimes(1);
    expect(onArchive).toHaveBeenCalledTimes(1);
  });

  it('closes via the backdrop', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderMenu(
      <OptionsMenu visible onClose={onClose} anchorTop={96}>
        <OptionsMenuItem icon={null} label="View Profile" onPress={jest.fn()} />
      </OptionsMenu>,
    );
    fireEvent.press(getByLabelText('Close options'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders destructive items in the error palette', () => {
    const { getByText } = renderMenu(
      <OptionsMenu visible onClose={jest.fn()} anchorTop={96}>
        <OptionsMenuItem icon={null} label="Delete" onPress={jest.fn()} destructive />
      </OptionsMenu>,
    );
    const label = getByText('Delete');
    expect(label.props.style).toEqual(expect.objectContaining({ color: '#FF6B65' }));
  });
});
