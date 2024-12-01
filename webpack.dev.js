/* eslint-env node */

const {mergeWithRules} = require("webpack-merge");
const common = require("./webpack.common.js");
const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");


module.exports = mergeWithRules({
    module: {
        rules: {
            test: "match",
            use: "replace",
        },
    },
})(common, {
    devServer: {
        client: {
            overlay: false,
        },
        hot: "only",
        open: true,
        port: 3010,
        watchFiles: ["src/services/**/*"],
    },
    devtool: "cheap-module-source-map",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                include: path.resolve(__dirname, "src"),
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            [
                                "@babel/preset-react",
                                {
                                    runtime: "automatic",
                                },
                            ],
                            "@babel/preset-typescript",
                        ],
                        plugins: [
                            require.resolve("react-refresh/babel"),
                        ],
                    },
                },
            },
        ],
    },
    output: {
        filename: "[name].bundle.js",
    },
    plugins: [
        new ReactRefreshWebpackPlugin({
            overlay: false,
        }),
        new ErrorOverlayPlugin(),
    ],
    resolve: {
        fallback: {
            // Needed by ErrorOverlayPlugin
            querystring: require.resolve("querystring-es3"),
        },
    },
});
