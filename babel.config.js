module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // for Expo projects, or use 'react-native' if not using Expo
      plugins: [
        [
          'module-resolver',
          {
            root: ['./'],
            alias: {
              '@': './', // this sets up your alias
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'], // make sure TypeScript extensions are included
          },
        ],
      ],
    };
  };
  