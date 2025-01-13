import CommonConfig from "eslint-config-yscope/CommonConfig.mjs";
import JestConfig from "eslint-config-yscope/JestConfig.mjs";
import ReactConfigArray from "eslint-config-yscope/ReactConfigArray.mjs";
import StylisticConfigArray from "eslint-config-yscope/StylisticConfigArray.mjs";
import TsConfigArray from "eslint-config-yscope/TsConfigArray.mjs";
import Globals from "globals";


const EslintConfig = [
    {
        ignores: [
            "dist/",
            "node_modules/",
        ],
    },
    CommonConfig,
    ...TsConfigArray.map(
        (config) => ({
            files: [
                "**/*.ts",
                "**/*.tsx",
            ],
            ...config,
        })
    ),
    ...StylisticConfigArray,
    ...ReactConfigArray,
    {
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            message: "Please use path imports and name your imports with postfix " +
                                "\"Icon\" to avoid confusions.",
                            name: "@mui/icons-material",
                        },
                    ],
                    patterns: [
                        {
                            group: [
                                "@mui/joy/*",
                                "!@mui/joy/styles",
                            ],
                            message: "Please use the default import from \"@mui/joy\" instead.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["webpack.*.js"],
        languageOptions: {
            globals: {
                ...Globals.node,
            },
        },
    },
    {
        files: ["test/**/*"],
        ...JestConfig,
    },
];


export default EslintConfig;
