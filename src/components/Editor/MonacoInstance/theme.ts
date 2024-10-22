import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {THEME_NAME} from "../../../typings/config";
import {TOKEN_NAME} from "./typings";


/**
 * Sets up custom themes for the Monaco editor.
 */
const setupThemes = () => {
    monaco.editor.defineTheme(THEME_NAME.DARK, {
        base: "vs-dark",
        inherit: true,
        rules: [
            {token: TOKEN_NAME.CUSTOM_INFO, foreground: "#098658"},
            {token: TOKEN_NAME.CUSTOM_WARN, foreground: "#ce9178"},
            {token: TOKEN_NAME.CUSTOM_ERROR, foreground: "#ce9178", fontStyle: "bold"},
            {token: TOKEN_NAME.CUSTOM_FATAL, foreground: "#ce9178", fontStyle: "bold"},
            {token: TOKEN_NAME.CUSTOM_DATE, foreground: "#529955"},
            {token: TOKEN_NAME.CUSTOM_EXCEPTION, foreground: "#ce723b", fontStyle: "italic"},
            {token: TOKEN_NAME.CUSTOM_NUMBER, foreground: "#3f9ccb"},
            {token: TOKEN_NAME.COMMENT, foreground: "#008000"},
        ],
        colors: {
            "editor.lineHighlightBackground": "#3c3c3c",
        },
    });
    monaco.editor.defineTheme(THEME_NAME.LIGHT, {
        base: "vs",
        inherit: true,
        rules: [
            {token: TOKEN_NAME.CUSTOM_INFO, foreground: "#098658"},
            {token: TOKEN_NAME.CUSTOM_WARN, foreground: "#b81560"},
            {token: TOKEN_NAME.CUSTOM_ERROR, foreground: "#ac1515", fontStyle: "bold"},
            {token: TOKEN_NAME.CUSTOM_FATAL, foreground: "#ac1515", fontStyle: "bold"},
            {token: TOKEN_NAME.CUSTOM_DATE, foreground: "#008000"},
            {token: TOKEN_NAME.CUSTOM_EXCEPTION, foreground: "#ce723b", fontStyle: "italic"},
            {token: TOKEN_NAME.CUSTOM_NUMBER, foreground: "#3f9ccb"},
        ],
        colors: {},
    });
};


export {setupThemes};
