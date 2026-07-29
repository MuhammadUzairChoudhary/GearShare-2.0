module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Only include reanimated plugin for non-test environments
      // to avoid issues with Jest and react-native-worklets
      ...(process.env.NODE_ENV !== 'test' ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
