import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';
import { StatusRail } from '../components/ui/StatusRail';
import type { RentalStatus } from '../types/rental';

function renderRail(status: RentalStatus) {
  return render(
    <ThemeProvider>
      <StatusRail currentStatus={status} />
    </ThemeProvider>,
  );
}

describe('StatusRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should expose a full text description for the active state (never colour alone)', () => {
    const { getByLabelText } = renderRail('active');
    expect(getByLabelText(/Rental status: Active/)).toBeTruthy();
    expect(getByLabelText(/Rental is in progress/)).toBeTruthy();
  });

  it('should describe the request-sent stage', () => {
    const { getByLabelText } = renderRail('request_sent');
    expect(getByLabelText(/Rental status: Request Sent/)).toBeTruthy();
    expect(getByLabelText(/awaiting the owner's confirmation/)).toBeTruthy();
  });

  it('should describe the action-required stage', () => {
    const { getByLabelText } = renderRail('action_required');
    expect(getByLabelText(/Action needed from you/)).toBeTruthy();
  });

  it('should describe the under-review (dispute) state in text', () => {
    const { getByLabelText } = renderRail('under_review');
    expect(getByLabelText(/An issue is under review/)).toBeTruthy();
  });

  it('should render an explicit cancelled message instead of a rail', () => {
    const { getByText } = renderRail('cancelled');
    expect(getByText('This rental was cancelled')).toBeTruthy();
  });
});
