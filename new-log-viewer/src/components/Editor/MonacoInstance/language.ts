import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {TOKEN_NAME} from "./typings";


const LOG_LANGUAGE_NAME = "logLanguage";


/**
 * Registers a custom log language in the Monaco editor.
 */
const setupCustomLogLanguage = () => {
    monaco.languages.register({
        id: LOG_LANGUAGE_NAME,
    });
    monaco.languages.setMonarchTokensProvider(LOG_LANGUAGE_NAME, {
        tokenizer: {
            root: [
                /* eslint-disable @stylistic/js/array-element-newline */
                ["INFO", TOKEN_NAME.CUSTOM_INFO],
                ["WARN", TOKEN_NAME.CUSTOM_WARN],
                ["ERROR", TOKEN_NAME.CUSTOM_ERROR],
                ["FATAL", TOKEN_NAME.CUSTOM_FATAL],
                [/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})Z/, TOKEN_NAME.CUSTOM_DATE],
                [/^[\t ]*at.*$/, TOKEN_NAME.CUSTOM_EXCEPTION],
                [/(\d+(?:\.\d+)?([eE])([+-])[0-9](\.[0-9])?|\d+(?:\.\d+)?)/, TOKEN_NAME.CUSTOM_NUMBER],
                /* eslint-enable @stylistic/js/array-element-newline */
            ],
        },
    });
};

export {
    LOG_LANGUAGE_NAME,
    setupCustomLogLanguage,
};
