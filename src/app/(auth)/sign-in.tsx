import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { TextInput } from '../../components/ui/TextInput';
import { Divider } from '../../components/ui/Divider';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { spacing } from '../../theme/spacing';
import { signInSchema } from '../../schemas';
import { ROUTES } from '../../constants/routes';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, pendingAction, setPendingAction } = useAuthContext();

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
            Welcome back
          </AppText>
          <AppText variant="bodyLarge" color="textSecondary" style={{ marginBottom: spacing.xxxxl }}>
            Sign in to manage your rentals.
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
            autoComplete="password"
            placeholder="Your password"
          />

          <View style={{ height: spacing.xxl }} />

          <AppButton
            title="Sign In"
            onPress={handleSignIn}
            variant="primary"
            fullWidth
            loading={isSubmitting}
          />

          <Divider />

          <AppButton
            title="Create Account"
            onPress={() => router.push(ROUTES.AUTH.REGISTER)}
            variant="secondary"
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
