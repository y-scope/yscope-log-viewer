/* eslint-env node */

const {mergeWithRules} = require("webpack-merge");
const common = require("./webpack.common.js");
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
        hot: "only",
        open: true,
        port: 3010,
        watchFiles: ["src/services/**/*"],
    },
    devtool: "eval-source-map",
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
        new ReactRefreshWebpackPlugin(),
    ],
});
