// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

// module.exports = getDefaultConfig(__dirname);

module.exports = (async () => {
    const { resolver: { sourceExts } } = await getDefaultConfig(__dirname);

    return { resolver: { sourceExts: [...sourceExts, 'jsx'] } };
})();