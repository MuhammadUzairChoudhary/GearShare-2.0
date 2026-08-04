import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Text, View, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { motionDuration, motionEasing, toastMotion, usePrefersReducedMotion } from '../theme/motion';

type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onPress: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastOptions {
  action?: ToastAction;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE_TOASTS = 3;

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const animValues = useRef<Record<string, Animated.Value>>({});
  const idCounter = useRef(0);

  const dismiss = useCallback(
    (id: string) => {
      const anim = animValues.current[id];
      if (anim) {
        Animated.timing(anim, {
          toValue: 0,
          duration: reducedMotion ? motionDuration.instant : toastMotion.exitDuration,
          easing: motionEasing.exit,
          useNativeDriver: true,
        }).start(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        });
      } else {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }
    },
    [reducedMotion],
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      idCounter.current += 1;
      const id = `toast-${idCounter.current}`;
      const anim = new Animated.Value(0);
      animValues.current[id] = anim;

      setToasts((prev) => {
        // Keep the stack compact — trim the oldest beyond the cap in the same,
        // pure update (no nested setState).
        const next = [...prev, { id, message, type, action: options?.action }];
        return next.length > MAX_VISIBLE_TOASTS
          ? next.slice(next.length - MAX_VISIBLE_TOASTS)
          : next;
      });

      Animated.timing(anim, {
        toValue: 1,
        duration: reducedMotion ? motionDuration.instant : toastMotion.enterDuration,
        easing: motionEasing.enter,
        useNativeDriver: true,
      }).start();

      setTimeout(() => dismiss(id), options?.durationMs ?? toastMotion.visibleMs);
    },
    [dismiss, reducedMotion],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const iconFor: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    info: 'information-circle',
  };
  const tintFor: Record<ToastType, string> = {
    success: colors.success,
    error: colors.error,
    info: colors.iceBlue,
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
          const tint = tintFor[toast.type];

          const toastStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            backgroundColor: colors.carbon850,
            borderRadius: radius.card,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderWidth: 1,
            borderColor: colors.graphite700,
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
                          outputRange: [16, 0],
                        }) ?? 0,
                    },
                  ],
                },
              ]}
              accessible
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Ionicons name={iconFor[toast.type]} size={18} color={tint} />
              <Text
                style={[
                  typography.bodyMedium,
                  { color: colors.titanium50, flex: 1 },
                ]}
              >
                {toast.message}
              </Text>
              {toast.action && (
                <TouchableOpacity
                  onPress={() => {
                    toast.action?.onPress();
                    dismiss(toast.id);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={toast.action.label}
                  style={{ paddingVertical: 2, paddingHorizontal: 4 }}
                >
                  <Text
                    style={[
                      typography.labelMedium,
                      { color: colors.signalLime, textTransform: 'uppercase' },
                    ]}
                  >
                    {toast.action.label}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}
