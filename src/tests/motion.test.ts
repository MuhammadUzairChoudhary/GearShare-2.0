import { motionDuration, motionEasing, pressMotion, sheetMotion, toastMotion } from '../theme/motion';

describe('Motion Tokens', () => {
  describe('motionDuration', () => {
    it('should define the full duration scale', () => {
      expect(motionDuration.instant).toBe(80);
      expect(motionDuration.fast).toBe(120);
      expect(motionDuration.standard).toBe(180);
      expect(motionDuration.deliberate).toBe(240);
      expect(motionDuration.completion).toBe(300);
    });

    it('should keep press feedback faster than standard transitions', () => {
      expect(motionDuration.instant).toBeLessThan(motionDuration.standard);
    });
  });

  describe('motionEasing', () => {
    it('should expose cubic-bezier easing functions', () => {
      // RN Easing.bezier returns a function (t) => number
      expect(typeof motionEasing.standard).toBe('function');
      expect(typeof motionEasing.enter).toBe('function');
      expect(typeof motionEasing.exit).toBe('function');
    });
  });

  describe('pressMotion', () => {
    it('should keep press scale restrained (0.992 max for cards, 0.985 for buttons)', () => {
      expect(pressMotion.pressedScale).toBe(0.992);
      expect(pressMotion.buttonPressedScale).toBe(0.985);
      expect(pressMotion.buttonPressedScale).toBeGreaterThanOrEqual(0.985);
      expect(pressMotion.pressedTranslateY).toBe(1);
    });
  });

  describe('sheetMotion / toastMotion', () => {
    it('should use deliberate sheet duration', () => {
      expect(sheetMotion.duration).toBe(240);
    });

    it('should use short toast enter/exit durations', () => {
      expect(toastMotion.enterDuration).toBeLessThan(240);
      expect(toastMotion.exitDuration).toBeLessThan(toastMotion.enterDuration);
      expect(toastMotion.visibleMs).toBe(3000);
    });
  });
});
