module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
    },
    "extends": [
        "plugin:react/recommended",
        "google",
    ],
    "overrides": [],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
    },
    "plugins": [
        "react",
        "simple-import-sort",
    ],
    "rules": {
        "brace-style": ["warn", "1tbs", {"allowSingleLine": true}],
        "comma-dangle": ["warn", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "never",
            "exports": "never",
            "functions": "never",
        }],
        "comma-spacing": "warn",
        "eol-last": "warn",
        "indent": ["warn", 4, {"SwitchCase": 1}],
        "key-spacing": "warn",
        "keyword-spacing": "warn",
        "max-len": ["warn", {
            "code": 100,
            "comments": 80,
            "ignoreComments": false,
            "ignoreTrailingComments": false,
        }],
        "no-multi-spaces": "warn",
        "no-multiple-empty-lines": "warn",
        "no-trailing-spaces": "warn",
        "no-unused-vars": "warn",
        "object-curly-spacing": "warn",
        "operator-linebreak": "off",
        "padded-blocks": "warn",
        "quotes": ["warn", "double", {"avoidEscape": true}],
        "require-jsdoc": "warn",
        "semi-spacing": "warn",
        "simple-import-sort/exports": "warn",
        "simple-import-sort/imports": ["warn", {
            "groups": [
                // Node.js builtins and react
                [`^(${require("module").builtinModules.join("|")})(/|$)`, "^react$"],
                // 3rd-party packages
                ["^@?\\w", "^(@|@company|@ui|components|utils|config|vendored-lib)(/.*|$)"],
                // Relative imports, parents first
                [
                    "^\\.\\.(?!/?$)",
                    "^\\.(?!/?$)",
                ],
                // Side effect imports
                ["^\\u0000"],
            ],
        }],
        "space-before-blocks": "warn",
        "space-before-function-paren": ["warn", "always"],
        "spaced-comment": "warn",
        "valid-jsdoc": "warn",
    },
};
