import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { AppButton } from '../../components/ui/AppButton';
import { TextInput } from '../../components/ui/TextInput';
import { spacing } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';

export default function VerifyScreen() {
  const [code, setCode] = useState('');

  const handleVerify = () => {
    router.replace(ROUTES.TABS.DISCOVER);
  };

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <AppText variant="displayMedium">Check your email</AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          We've sent a verification code to your email address. Enter it below to verify your
          account.
        </AppText>

        <TextInput
          label="Verification Code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder="000000"
          maxLength={6}
        />

        <AppButton title="Verify Email" onPress={handleVerify} variant="primary" fullWidth />

        <AppButton
          title="Back to Sign In"
          onPress={() => router.push(ROUTES.AUTH.SIGN_IN)}
          variant="ghost"
          fullWidth
        />
      </View>
    </Screen>
  );
}
