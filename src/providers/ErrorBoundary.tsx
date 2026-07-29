import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Wrap in a function component to use hooks
function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxxl,
        backgroundColor: colors.background,
        gap: spacing.md,
      }}
      accessibilityRole="alert"
    >
      <Text style={[typography.titleLarge, { color: colors.error }]}>Unexpected Error</Text>
      <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
        {error?.message ?? 'An unexpected error occurred'}
      </Text>
      <TouchableOpacity
        style={{
          paddingHorizontal: spacing.xxl,
          paddingVertical: spacing.md,
          borderRadius: radius.button,
          backgroundColor: colors.signalLime,
        }}
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text style={[typography.labelLarge, { color: colors.carbon950 }]}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
