const webpack = require('webpack')

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {}
    Object.assign(fallback, {
        "fs": require.resolve('browserify-fs'),
        "buffer": require.resolve("buffer/"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "constants": require.resolve("constants-browserify"),
    })
    config.resolve.fallback = fallback
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    return config
}
