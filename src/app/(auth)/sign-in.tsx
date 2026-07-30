import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/ui/Screen';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/spacing';
import { fontFamilies, typography } from '../../theme/typography';
import { rf } from '../../theme/responsiveFont';
import { signInSchema } from '../../schemas';
import { ROUTES } from '../../constants/routes';

export default function SignInScreen() {
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, pendingAction, setPendingAction } = useAuthContext();

  // Figma light-mode colors (hardcoded for precise match)
  const figma = {
    textDark: '#1F2225',
    textLabel: 'rgba(44, 48, 52, 0.4)',
    textSubtitle: 'rgba(44, 48, 52, 0.6)',
    textPlaceholder: '#9CA3AF',
    textMuted: '#9CA3AF',
    border: '#DDE1E3',
    darkBg: '#171A1C',
    darkBorder: '#1F2225',
  };

  // Derive mode-aware values
  const effectiveTextColor = isDark ? colors.textPrimary : figma.textDark;
  const effectiveLabelColor = isDark ? colors.textSecondary : figma.textLabel;
  const effectivePlaceholderColor = isDark ? colors.textTertiary : figma.textPlaceholder;
  const effectiveBorderColor = isDark ? colors.border : figma.border;
  const effectiveSubtitleColor = isDark ? colors.textSecondary : figma.textSubtitle;
  const effectiveMutedColor = isDark ? colors.textTertiary : figma.textMuted;
  const effectiveDarkBg = isDark ? colors.carbon850 : figma.darkBg;
  const effectiveDarkBorder = isDark ? colors.graphite700 : figma.darkBorder;

  const handleSignIn = async () => {
    setError(null);

    const result = signInSchema.safeParse({ email, password });
    if (result.error) {
      setError(result.error.message ?? 'Validation error');
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setIsSubmitting(false);

    if (signInError) {
      setError(signInError);
      return;
    }

    // Return user to their intended action
    if (pendingAction) {
      const { type, listingId } = pendingAction;
      setPendingAction(null);

      switch (type) {
        case 'request-rental':
          router.replace(`/rental/request/${listingId}` as any);
          break;
        case 'message-owner':
          router.replace(`/listing/${listingId}` as any);
          break;
        case 'save-listing':
          router.replace(`/listing/${listingId}` as any);
          break;
        default:
          router.replace(ROUTES.TABS.DISCOVER);
      }
    } else {
      router.replace(ROUTES.TABS.DISCOVER);
    }
  };

  // ======= Styles =======

  const inputContainerStyle: ViewStyle = {
    gap: 8,
    width: '100%',
  };

  const labelStyle: TextStyle = {
    fontFamily: fontFamilies.inter.semiBold,
    fontSize: rf(12),
    lineHeight: rf(16),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: effectiveLabelColor,
  };

  const inputStyle: ViewStyle = {
    width: '100%',
    height: 56,
    backgroundColor: isDark ? colors.surface : colors.white,
    borderWidth: 1,
    borderColor: effectiveBorderColor,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  };

  const inputTextStyle: TextStyle = {
    fontFamily: fontFamilies.inter.medium,
    fontSize: rf(16),
    lineHeight: rf(19),
    color: isDark ? colors.textPrimary : effectiveTextColor,
    padding: 0,
    margin: 0,
  };

  return (
    <Screen safeArea padded={false} scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ===== Header with Back Button ===== */}
          <View
            style={{
              paddingTop: spacing.xxxxxl,
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.lg,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: effectiveBorderColor,
                backgroundColor: isDark ? colors.surface : colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="arrow-back"
                size={16}
                color={effectiveTextColor}
              />
            </TouchableOpacity>
          </View>

          {/* ===== Heading Area ===== */}
          <View
            style={{
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.xxxxl,
              gap: 12,
            }}
          >
            <Text
              style={{
                fontFamily: fontFamilies.spaceGrotesk.bold,
                fontSize: rf(36),
                lineHeight: rf(40),
                letterSpacing: -0.9,
                color: effectiveTextColor,
              }}
            >
              Sign In
            </Text>

            <Text
              style={{
                fontFamily: fontFamilies.inter.regular,
                fontSize: rf(16),
                lineHeight: rf(26),
                color: effectiveSubtitleColor,
              }}
            >
              Access your gear and rentals.
            </Text>
          </View>

          {/* ===== Form ===== */}
          <View
            style={{
              paddingHorizontal: spacing.xxl,
              gap: 24,
            }}
          >
            {/* Error Message */}
            {error && (
              <View
                style={{
                  backgroundColor: isDark ? colors.errorBackground : '#FEF2F2',
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderRadius: radius.input,
                  borderWidth: 1,
                  borderColor: isDark ? colors.error : '#FECACA',
                }}
              >
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: colors.error },
                  ]}
                  accessibilityRole="alert"
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Email Field */}
            <View style={inputContainerStyle}>
              <Text style={labelStyle}>Email Address</Text>
              <View style={inputStyle}>
                <RNTextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="name@example.com"
                  placeholderTextColor={effectivePlaceholderColor}
                  style={inputTextStyle}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={inputContainerStyle}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={labelStyle}>Password</Text>
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Navigate to Forgot Password
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                >
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.medium,
                      fontSize: rf(12),
                      lineHeight: rf(16),
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                      color: isDark ? colors.textPrimary : figma.textDark,
                    }}
                  >
                    Forgot?
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  inputStyle,
                  {
                    paddingRight: 48,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >
                <RNTextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  placeholder="••••••••"
                  placeholderTextColor={effectivePlaceholderColor}
                  style={[inputTextStyle, { flex: 1 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: spacing.lg,
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={effectiveMutedColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={{
                width: '100%',
                height: 56,
                backgroundColor: colors.signalLime,
                borderRadius: radius.button,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.signalLime,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 4,
                opacity: isSubmitting ? 0.7 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              {isSubmitting ? (
                <Ionicons name="sync-outline" size={22} color={colors.carbon950} />
              ) : (
                <Text
                  style={{
                    fontFamily: fontFamilies.spaceGrotesk.bold,
                    fontSize: rf(16),
                    lineHeight: rf(24),
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: colors.carbon950,
                  }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* ===== "or continue with" Divider ===== */}
            <View
              style={{
                paddingVertical: spacing.xxxxl,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: isDark ? colors.graphite700 : figma.textDark,
                  }}
                />
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.bold,
                    fontSize: rf(11),
                    lineHeight: rf(16),
                    letterSpacing: 1.1,
                    textTransform: 'uppercase',
                    color: effectiveLabelColor,
                  }}
                >
                  or continue with
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: isDark ? colors.graphite700 : figma.textDark,
                  }}
                />
              </View>
            </View>

            {/* ===== Social Buttons ===== */}
            <View
              style={{
                flexDirection: 'row',
                gap: 16,
              }}
            >
              {/* Apple Button */}
              <TouchableOpacity
                onPress={() => {
                  // TODO: Implement Apple Sign In
                }}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  height: 56,
                  backgroundColor: effectiveDarkBg,
                  borderWidth: 1,
                  borderColor: effectiveDarkBorder,
                  borderRadius: radius.button,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Apple"
              >
                <Ionicons name="logo-apple" size={18} color={colors.white} />
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.medium,
                    fontSize: rf(14),
                    lineHeight: rf(20),
                    color: colors.white,
                    letterSpacing: 0.021,
                  }}
                >
                  Apple
                </Text>
              </TouchableOpacity>

              {/* Google Button */}
              <TouchableOpacity
                onPress={() => {
                  // TODO: Implement Google Sign In
                }}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  height: 56,
                  backgroundColor: effectiveDarkBg,
                  borderWidth: 1,
                  borderColor: effectiveDarkBorder,
                  borderRadius: radius.button,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                <Ionicons name="logo-google" size={18} color={colors.white} />
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.medium,
                    fontSize: rf(14),
                    lineHeight: rf(20),
                    color: colors.white,
                    letterSpacing: 0.018,
                  }}
                >
                  Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* ===== "Don't have an account? Register" ===== */}
            <View
              style={{
                paddingTop: spacing.xxxxxl,
                paddingBottom: spacing.xxxl,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.inter.regular,
                    fontSize: rf(14),
                    lineHeight: rf(20),
                    color: effectiveMutedColor,
                  }}
                >
                  Don't have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(ROUTES.AUTH.REGISTER)}
                  accessibilityRole="button"
                  accessibilityLabel="Register"
                >
                  <Text
                    style={{
                      fontFamily: fontFamilies.inter.semiBold,
                      fontSize: rf(14),
                      lineHeight: rf(20),
                      letterSpacing: 0.0049,
                      color: isDark ? colors.textPrimary : figma.darkBg,
                    }}
                  >
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== Page Indicator ===== */}
            <View
              style={{
                paddingBottom: spacing.xxxl,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  opacity: 0.2,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: colors.signalLime,
                  }}
                />
                <View
                  style={{
                    width: 48,
                    height: 1,
                    backgroundColor: colors.signalLime,
                  }}
                />
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: colors.signalLime,
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
