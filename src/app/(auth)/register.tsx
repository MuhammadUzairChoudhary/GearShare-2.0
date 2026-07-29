import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { TextInput } from '../../components/ui/TextInput';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { spacing } from '../../theme/spacing';
import { registerSchema } from '../../schemas';
import { ROUTES } from '../../constants/routes';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuthContext();

  const handleRegister = async () => {
    setError(null);

    const result = registerSchema.safeParse({ email, password, confirmPassword, fullName });
    if (result.error) {
      setError(result.error.message ?? 'Validation error');
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    router.replace(ROUTES.AUTH.VERIFY);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="displayMedium" style={{ marginBottom: spacing.sm }}>
            Join GearShare
          </AppText>
          <AppText
            variant="bodyLarge"
            color="textSecondary"
            style={{ marginBottom: spacing.xxxxl }}
          >
            Create an account to get started.
          </AppText>

          {error && (
            <AppText
              variant="bodyMedium"
              color="error"
              style={{ marginBottom: spacing.md }}
              accessibilityRole="alert"
            >
              {error}
            </AppText>
          )}

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Alex Morgan"
          />

          <View style={{ height: spacing.lg }} />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="your@email.com"
          />

          <View style={{ height: spacing.lg }} />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />

          <View style={{ height: spacing.lg }} />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="Repeat your password"
          />

          <View style={{ height: spacing.xxl }} />

          <AppButton
            title="Create Account"
            onPress={handleRegister}
            variant="primary"
            fullWidth
            loading={isSubmitting}
          />

          <View style={{ height: spacing.lg }} />

          <AppButton
            title="Already have an account? Sign In"
            onPress={() => router.push(ROUTES.AUTH.SIGN_IN)}
            variant="ghost"
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
