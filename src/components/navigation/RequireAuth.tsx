import React from 'react';
import { router, usePathname } from 'expo-router';
import { useAuthContext } from '../../features/auth/AuthProvider';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';
import { spacing } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import type { PendingAuthIntent } from '../../types/auth-intent';

interface RequireAuthProps {
  children: React.ReactNode;
  action?: string;
}

export function RequireAuth({ children, action = 'perform this action' }: RequireAuthProps) {
  const { isAuthenticated, isLoading, setPendingAction } = useAuthContext();
  const currentPath = usePathname();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    const handleSignIn = () => {
      const intent: PendingAuthIntent = {
        type: 'request-rental',
        listingId: currentPath.split('/').pop() ?? '',
      };
      setPendingAction(intent);
      router.push(ROUTES.AUTH.SIGN_IN);
    };

    return (
      <Screen padded>
        <AppText variant="titleMedium" align="center" style={{ marginTop: spacing.xxxxl }}>
          Sign in required
        </AppText>
        <AppText
          variant="bodyMedium"
          color="textSecondary"
          align="center"
          style={{ marginTop: spacing.md, marginBottom: spacing.xxl }}
        >
          Please sign in to {action}.
        </AppText>
        <AppButton
          title="Sign In"
          onPress={handleSignIn}
          variant="primary"
          fullWidth
        />
      </Screen>
    );
  }

  return <>{children}</>;
}
