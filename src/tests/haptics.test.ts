import * as ExpoHaptics from 'expo-haptics';
import { haptics } from '../services/feedback/haptics';

const mockedExpoHaptics = ExpoHaptics as jest.Mocked<typeof ExpoHaptics>;

describe('haptics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    haptics._setEnabled(true);
  });

  afterAll(() => {
    haptics._setEnabled(true);
  });

  it('should map selection to selectionAsync', () => {
    haptics.selection();
    expect(mockedExpoHaptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('should map action to a light impact', () => {
    haptics.action();
    expect(mockedExpoHaptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('should map success to a success notification', () => {
    haptics.success();
    expect(mockedExpoHaptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('should map warning to a warning notification', () => {
    haptics.warning();
    expect(mockedExpoHaptics.notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('should map error to an error notification', () => {
    haptics.error();
    expect(mockedExpoHaptics.notificationAsync).toHaveBeenCalledWith('error');
  });

  it('should not fire any haptic when disabled', () => {
    haptics._setEnabled(false);
    haptics.selection();
    haptics.action();
    haptics.success();
    haptics.warning();
    haptics.error();
    expect(mockedExpoHaptics.selectionAsync).not.toHaveBeenCalled();
    expect(mockedExpoHaptics.impactAsync).not.toHaveBeenCalled();
    expect(mockedExpoHaptics.notificationAsync).not.toHaveBeenCalled();
  });
});
