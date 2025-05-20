import CommonConfig from "eslint-config-yscope/CommonConfig.mjs";
import JestConfig from "eslint-config-yscope/JestConfig.mjs";
import ReactConfigArray from "eslint-config-yscope/ReactConfigArray.mjs";
import StylisticConfigArray from "eslint-config-yscope/StylisticConfigArray.mjs";
import TsConfigArray, {createTsConfigOverride} from "eslint-config-yscope/TsConfigArray.mjs";


const EslintConfig = [
    {
        ignores: [
            "dist/",
            "node_modules/",
        ],
    },
    CommonConfig,

    ...TsConfigArray,
    createTsConfigOverride(
        [
            "src/**/*.ts",
            "src/**/*.tsx",
            "test/**/*.ts",
        ],
        "tsconfig.app.json"
    ),
    createTsConfigOverride(
        [
            "jest.config.ts",
            "vite.config.ts",
        ],
        "tsconfig.node.json"
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
        settings: {
            // Rule "import/default" complains on Vite's web worker import directives.
            "import/ignore": [
                "\\.worker",
            ],
        },
    },
    {
        files: ["test/**/*"],
        ...JestConfig,
    },
];


export default EslintConfig;
