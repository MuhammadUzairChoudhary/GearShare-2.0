import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const animValues = useRef<Record<string, Animated.Value>>({});

  const removeToast = useCallback((id: string) => {
    const anim = animValues.current[id];
    if (anim) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      });
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now().toString();
      const anim = new Animated.Value(0);
      animValues.current[id] = anim;

      setToasts((prev) => [...prev, { id, message, type }]);

      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const toastColors: Record<ToastType, { bg: string; text: string }> = {
    success: { bg: colors.successBackground ?? '#14291B', text: colors.success ?? '#73D98B' },
    error: { bg: colors.errorBackground ?? '#321817', text: colors.error ?? '#FF6B65' },
    info: { bg: colors.informationBackground ?? '#13262D', text: colors.iceBlue ?? '#69C8E8' },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          left: spacing.lg,
          right: spacing.lg,
          gap: spacing.sm,
          pointerEvents: 'box-none',
        }}
      >
        {toasts.map((toast) => {
          const colors__ = toastColors[toast.type];

          const toastStyle: ViewStyle = {
            backgroundColor: colors__.bg,
            borderRadius: radius.card,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderWidth: 1,
            borderColor: colors__.text,
          };

          return (
            <Animated.View
              key={toast.id}
              style={[
                toastStyle,
                {
                  opacity: animValues.current[toast.id],
                  transform: [
                    {
                      translateY:
                        animValues.current[toast.id]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }) ?? 0,
                    },
                  ],
                },
              ]}
              accessibilityRole="alert"
            >
              <Text style={[typography.bodyMedium, { color: colors__.text }]}>{toast.message}</Text>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}
