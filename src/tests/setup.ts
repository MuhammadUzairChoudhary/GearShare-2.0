// Prevent TurboModule crashes in RN 0.76+ Jest environment
// Mock only the TurboModule registry, not the entire react-native package
const mockPlatformConstants = {
  forceTouchAvailable: false,
  isTesting: true,
  reactNativeVersion: { major: 0, minor: 76, patch: 7 },
};

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: () => ({ getConstants: () => mockPlatformConstants }),
  get: () => ({ getConstants: () => mockPlatformConstants }),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  Stack: { Screen: 'StackScreen' },
  Tabs: { Screen: 'TabsScreen' },
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  Redirect: 'Redirect',
}));

// Mock Expo modules
jest.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
jest.mock('expo-constants', () => ({ default: { manifest: { extra: {} }, executionEnvironment: 'storeClient' } }));
jest.mock('expo-font', () => ({ loadAsync: jest.fn(() => Promise.resolve()), isLoaded: jest.fn(() => true), useFonts: jest.fn(() => [true, null]) }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: ({ name }: { name: string }) => null }));

// Mock React Native Reanimated (v3 compatible)
jest.mock('react-native-reanimated', () => {
  try {
    const Reanimated = require('react-native-reanimated/mock');
    return {
      ...Reanimated,
      default: {
        ...Reanimated.default,
        createAnimatedComponent: (component: any) => component,
      },
    };
  } catch {
    return {
      createAnimatedComponent: (component: any) => component,
      useSharedValue: jest.fn(() => ({ value: 0 })),
      useAnimatedStyle: jest.fn(() => ({})),
      withTiming: jest.fn(() => 0),
      withSpring: jest.fn(() => 0),
      default: { createAnimatedComponent: (component: any) => component },
    };
  }
});

// Set test environment variables
process.env.EXPO_PUBLIC_USE_MOCK_DATA = 'true';
process.env.EXPO_PUBLIC_APP_ENV = 'test';
