const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push("cjs");
// Allow bundling bundled language packs (en.zip/es.zip) as assets.
defaultConfig.resolver.assetExts.push("zip");
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
