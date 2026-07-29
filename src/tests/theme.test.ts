import { colors, themeColors, spacing, radius, typography } from '../theme';

describe('Theme Tokens', () => {
  describe('colors', () => {
    it('should have core palette colors', () => {
      expect(colors.carbon950).toBe('#0B0D0E');
      expect(colors.carbon850).toBe('#171A1C');
      expect(colors.signalLime).toBe('#C8FF3D');
      expect(colors.white).toBe('#FFFFFF');
    });

    it('should have semantic colors', () => {
      expect(colors.success).toBe('#73D98B');
      expect(colors.warning).toBe('#F2C94C');
      expect(colors.error).toBe('#FF6B65');
      expect(colors.information).toBe('#69C8E8');
    });
  });

  describe('themeColors', () => {
    it('should have light theme', () => {
      expect(themeColors.light.background).toBe(colors.white);
      expect(themeColors.light.textPrimary).toBe(colors.carbon950);
    });

    it('should have dark theme', () => {
      expect(themeColors.dark.background).toBe(colors.carbon950);
      expect(themeColors.dark.textPrimary).toBe(colors.titanium50);
    });
  });

  describe('spacing', () => {
    it('should have all spacing values', () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(12);
      expect(spacing.lg).toBe(16);
      expect(spacing.xl).toBe(20);
      expect(spacing.xxl).toBe(24);
      expect(spacing.xxxl).toBe(32);
      expect(spacing.xxxxl).toBe(40);
      expect(spacing.xxxxxl).toBe(48);
      expect(spacing.xxxxxxl).toBe(64);
    });
  });

  describe('radius', () => {
    it('should have all radius values', () => {
      expect(radius.button).toBe(8);
      expect(radius.card).toBe(10);
      expect(radius.input).toBe(8);
      expect(radius.chip).toBe(6);
      expect(radius.image).toBe(10);
      expect(radius.bottomSheet).toBe(18);
    });
  });

  describe('typography', () => {
    it('should have display styles', () => {
      expect(typography.displayLarge.fontSize).toBe(40);
      expect(typography.displayMedium.fontSize).toBe(32);
    });

    it('should have title styles', () => {
      expect(typography.titleLarge.fontSize).toBe(24);
      expect(typography.titleSmall.fontSize).toBe(16);
    });

    it('should have body styles', () => {
      expect(typography.bodyLarge.fontSize).toBe(16);
      expect(typography.bodySmall.fontSize).toBe(12);
    });

    it('should have mono styles', () => {
      expect(typography.monoMedium.fontSize).toBe(16);
      expect(typography.monoSmall.fontSize).toBe(12);
    });
  });
});
