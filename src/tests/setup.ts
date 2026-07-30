// GearShare Test Setup
// Uses targeted RN mock with real createElement components for RNTL compatibility

// ==============================
// 1. TurboModule Registry Mock (preempts native module crashes)
// ==============================
const mockPlatformConstants = {
  forceTouchAvailable: false,
  isTesting: true,
  reactNativeVersion: { major: 0, minor: 76, patch: 7 },
};

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: () => ({ getConstants: () => mockPlatformConstants }),
  get: () => ({ getConstants: () => mockPlatformConstants }),
}));

// ==============================
// 2. React Native Core Component Mocks
// ==============================
// We use createElement with proper prop passthrough so RNTL queries work correctly
jest.mock('react-native', () => {
  const React = require('react');

  // Helper: generic host component factory
  const host = (displayName: string) =>
    ({ children, ...props }: any) =>
      React.createElement(displayName, props, children);

  const View = host('View');
  const Text = host('Text');
  const Image = host('Image');
  const ScrollView = host('ScrollView');
  const SafeAreaView = host('SafeAreaView');
  const ActivityIndicator = host('ActivityIndicator');
  const StatusBar = host('StatusBar');
  const KeyboardAvoidingView = host('KeyboardAvoidingView');
  const Modal = ({ visible, children, ...props }: any) =>
    visible ? React.createElement('Modal', props, children) : null;

  // TouchableOpacity: preserves accessibilityRole (via ...props) and omits onPress when disabled
  const TouchableOpacity = ({
    children,
    onPress,
    disabled,
    style,
    testID,
    accessibilityLabel,
    ...props
  }: any) => {
    const finalProps: Record<string, any> = { style, testID, ...props };
    if (accessibilityLabel != null) {
      finalProps['aria-label'] = accessibilityLabel;
    }
    // Only include onPress when NOT disabled, so RNTL fireEvent.press can't find it when disabled
    if (!disabled && typeof onPress === 'function') {
      finalProps.onPress = onPress;
    }
    return React.createElement('RCTTouchableOpacity', finalProps, children);
  };

  // FlatList: renders data items for list testing
  const FlatList = ({ data, renderItem, keyExtractor, style, testID, ...props }: any) => {
    const items = data || [];
    return React.createElement(
      'FlatList',
      { style, testID, ...props },
      items.map((item: any, i: number) => {
        const key = keyExtractor?.(item, i) ?? String(i);
        return React.createElement('View', { key }, renderItem?.({ item, index: i }));
      }),
    );
  };

  // Other touchable/pressable components
  const Pressable = ({ children, onPress, style, testID, ...props }: any) =>
    React.createElement('Pressable', { style, testID, onPress, ...props }, children);

  const TouchableHighlight = ({
    children,
    onPress,
    style,
    testID,
    ...props
  }: any) =>
    React.createElement('TouchableHighlight', { style, testID, onPress, ...props }, children);

  const Switch = ({ value, onValueChange, ...props }: any) =>
    React.createElement('Switch', { value, onChange: onValueChange, ...props });

  // Inputs
  const TextInput = ({ value, onChangeText, placeholder, style, testID, ...props }: any) =>
    React.createElement('TextInput', {
      value,
      onChangeText,
      placeholder,
      style,
      testID,
      ...props,
    });

  // Utilities
  const StyleSheet = {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
    hairlineWidth: 1,
  };

  const Platform = { OS: 'ios', select: (obj: any) => obj.ios ?? obj.default, Version: '15.0' };
  const Dimensions = {
    get: (key: string) => (key === 'screen' ? { width: 390, height: 844 } : { width: 390, height: 844 }),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };
  const PixelRatio = { get: jest.fn(() => 3), getFontScale: jest.fn(() => 1), roundToNearestPixel: jest.fn((x: number) => x) };

  // Hooks
  const useColorScheme = jest.fn(() => 'dark');
  const useWindowDimensions = jest.fn(() => ({ width: 390, height: 844, scale: 1, fontScale: 1 }));

  // Animated
  const Animated = {
    View,
    Text,
    Image,
    ScrollView,
    createAnimatedComponent: (component: any) => component,
    timing: () => ({ start: jest.fn() }),
    spring: () => ({ start: jest.fn() }),
    Value: jest.fn(),
    event: jest.fn(),
    sequence: jest.fn(),
    parallel: jest.fn(),
    stagger: jest.fn(),
    loop: jest.fn(),
    delay: jest.fn(),
  };

  // App state & linking
  const AppState = {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };

  const Linking = {
    openURL: jest.fn(() => Promise.resolve(true)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };

  const Alert = { alert: jest.fn() };
  const RefreshControl = (props: any) => React.createElement('RefreshControl', props);
  const Appearance = {
    getColorScheme: jest.fn(() => 'dark'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  };

  return {
    View,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    ActivityIndicator,
    Image,
    TextInput,
    ScrollView,
    SafeAreaView,
    RefreshControl,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    Switch,
    StatusBar,
    StyleSheet,
    Platform,
    Dimensions,
    PixelRatio,
    Animated,
    FlatList,
    AppState,
    Linking,
    Alert,
    Appearance,
    useColorScheme,
    useWindowDimensions,
  };
});

// ==============================
// 3. Expo Module Mocks
// ==============================

jest.mock('expo-router', () => ({
  Stack: { Screen: 'StackScreen' },
  Tabs: { Screen: 'TabsScreen' },
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  Redirect: 'Redirect',
}));

jest.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
jest.mock('expo-constants', () => ({
  default: {
    manifest: { extra: {} },
    executionEnvironment: 'storeClient',
    expoConfig: { extra: {} },
  },
}));
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  useFonts: jest.fn(() => [true, null]),
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-image', () => {
  const React = require('react');
  const Image = (props: any) => React.createElement('Image', props);
  return { Image };
});
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = ({ name, size, color, testID }: any) =>
    React.createElement('Icon', { name, size, color, testID });
  return { Ionicons: MockIcon, MaterialIcons: MockIcon, Feather: MockIcon };
});

// ==============================
// 4. React Native Reanimated Mock
// ==============================

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
      withSequence: jest.fn(() => 0),
      withDelay: jest.fn(() => 0),
      withRepeat: jest.fn(() => 0),
      Easing: { in: jest.fn(), out: jest.fn(), inOut: jest.fn() },
      default: { createAnimatedComponent: (component: any) => component },
    };
  }
});

// ==============================
// 5. Global Variables & Environment
// ==============================

(global as any).__DEV__ = true;

process.env.EXPO_PUBLIC_USE_MOCK_DATA = 'true';
process.env.EXPO_PUBLIC_APP_ENV = 'test';
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
