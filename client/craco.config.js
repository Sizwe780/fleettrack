// craco.config.js
const path = require("path");

module.exports = {
  style: {
    postcss: {
      mode: "file" // prevent CRACO from injecting tailwindcss as a PostCSS plugin
    }
  },
  webpack: {
    configure: (webpackConfig) => {
      // Insert a rule near the beginning that handles leaflet CSS with null-loader
      const leafletCssRule = {
        test: /node_modules[\\/]leaflet.*\.css$|node_modules[\\/]leaflet\.markercluster.*\.css$/,
        use: [
          {
            loader: require.resolve("null-loader")
          }
        ]
      };

      // Put the new rule before other rules that process css
      if (webpackConfig && webpackConfig.module && Array.isArray(webpackConfig.module.rules)) {
        // Find index to insert before the rule that contains oneOf (CRA layout)
        const idx = webpackConfig.module.rules.findIndex(r => r.oneOf);
        if (idx >= 0) {
          webpackConfig.module.rules.splice(idx, 0, leafletCssRule);
        } else {
          // fallback: push at start
          webpackConfig.module.rules.unshift(leafletCssRule);
        }
      }

      // Also ensure PostCSS uses the file config (safety)
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = webpackConfig.resolve.alias || {};
      // no alias changes needed here, but left available for future tweaks

      return webpackConfig;
    }
  }
};