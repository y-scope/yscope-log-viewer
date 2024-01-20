import React, {useContext, useEffect, useRef} from "react";

import * as monaco from "monaco-editor";
import PropTypes from "prop-types";

import {THEME_STATES} from "../../../ThemeContext/THEME_STATES";
import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import {SHORTCUTS} from "./Shortcuts";

import "./MonacoInstance.scss";

// Themes for monaco editor
const themes = {
    dark: {
        base: "vs-dark",
        inherit: true,
        rules: [
            {token: "custom-info", foreground: "#098658"},
            {token: "custom-warn", foreground: "#ce9178"},
            {token: "custom-error", foreground: "#ce9178", fontStyle: "bold"},
            {token: "custom-fatal", foreground: "#ce9178", fontStyle: "bold"},
            {token: "custom-date", foreground: "#529955"},
            {token: "custom-number", foreground: "#3f9ccb"},
            {token: "custom-exception", foreground: "#ce723b", fontStyle: "italic"},
            {token: "comment", foreground: "#008000"},
        ],
        colors: {
            "editor.lineHighlightBackground": "#3c3c3c",
        },
    },
    light: {
        base: "vs",
        inherit: true,
        rules: [
            {token: "custom-info", foreground: "#098658"},
            {token: "custom-warn", foreground: "#b81560"},
            {token: "custom-error", foreground: "#ac1515", fontStyle: "bold"},
            {token: "custom-fatal", foreground: "#ac1515", fontStyle: "bold"},
            {token: "custom-date", foreground: "#008000"},
            {token: "custom-number", foreground: "#3f9ccb"},
            {token: "custom-exception", foreground: "#ce723b", fontStyle: "italic"},
        ],
        colors: {},
    },
};

MonacoInstance.propTypes = {
    logFileState: PropTypes.object,
    loadingLogs: PropTypes.bool,
    logData: PropTypes.string,
    onStateChange: PropTypes.func,
    beforeMount: PropTypes.func,
    onMount: PropTypes.func,
};

/**
 * Callback used to change the parent component's state
 * @callback StateChangeCallback
 * @param {string} type The type of state change ({@link STATE_CHANGE_TYPE})
 * @param {object} args Arguments used to update the state
 */

/**
 * Callback that gets called BEFORE the Monaco Editor is mounted
 * @callback BeforeMountCallback
 */

/**
 * Callback that gets called AFTER the Monaco Editor is mounted
 * @callback MountCallback
 */

/**
 * Contains the monaco editor used to display the log data. When user
 * interacts with editor, the callback is used to update the selected
 * log event.
 *
 * @param {object} logFileState Current state of the log file
 * @param {boolean} loadingLogs Indicates if loading is in progress
 * @param {string} logData Decoded log data to display
 * @param {StateChangeCallback} onStateChange
 * @param {BeforeMountCallback} beforeMount
 * @param {MountCallback} onMount
 * @return {JSX.Element}
 * @constructor
 */
function MonacoInstance ({
    logFileState,
    loadingLogs,
    logData,
    onStateChange,
    beforeMount,
    onMount,
}) {
    const {theme} = useContext(ThemeContext);
    const editorRef = useRef(null);
    const editorContainerRef = useRef(null);
    const timeoutRef = useRef(null);
    const getMonacoThemeName = (theme) => (
        (theme === THEME_STATES.LIGHT) ? "customLogLanguageLight" : "customLogLanguageDark"
    );

    /**
     * Called before the monaco editor is mounted.
     */
    const _beforeMount = () => {
        beforeMount();

        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.editor.defineTheme("customLogLanguageDark", themes.dark);
        monaco.editor.defineTheme("customLogLanguageLight", themes.light);

        monaco.languages.register({
            id: "logLanguage",
        });

        monaco.languages.setMonarchTokensProvider("logLanguage", {
            tokenizer: {
                root: [
                    ["INFO", "custom-info"],
                    ["ERROR", "custom-error"],
                    ["WARN", "custom-warn"],
                    ["FATAL", "custom-fatal"],
                    [/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})Z/, "custom-date"],
                    [/^[\t ]*at.*$/, "custom-exception"],
                    [/(\d+(?:\.\d+)?([eE])([+\-])[0-9](\.[0-9])?|\d+(?:\.\d+)?)/, "custom-number"],
                ],
            },
        });
    };


    /**
     * Called when editor is finished mounting.
     */
    const _onMount = () => {
        editorRef.current.setValue(logData);
        editorRef.current.revealLine(logFileState.lineNumber, 1);
        editorRef.current.setPosition({column: 1, lineNumber: logFileState.lineNumber});
        editorRef.current.focus();
        editorRef.current.onDidChangeCursorPosition((e) => {
            // only trigger if there was an explicit change that
            // was made by keyboard or mouse
            // 3 is monacoRef.current.CursorChangeReason.Explicit
            if (3 === e.reason) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    onStateChange(STATE_CHANGE_TYPE.lineNumber, {
                        lineNumber: e.position.lineNumber,
                        columnNumber: e.position.column,
                    });
                }, 50);
            }
        });
        onMount();
    };

    useEffect(() => {
        if (null !== editorRef.current) {
            for (const shortcut of SHORTCUTS) {
                editorRef.current.addAction({
                    id: shortcut.id,
                    label: shortcut.label,
                    keybindings: [
                        shortcut.keybindings,
                    ],
                    run: () => {
                        if (!loadingLogs) {
                            onStateChange(shortcut.action, shortcut.actionArgs);
                        }
                    },
                });
            }
            editorRef.current.addAction({
                id: "topOfPage",
                label: "Go To Top Of Page",
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU,
                ],
                run: () => {
                    if (!loadingLogs) {
                        onStateChange(STATE_CHANGE_TYPE.lineNumber, {
                            lineNumber: 1,
                            columnNumber: 1,
                        });
                    }
                },
            });
            editorRef.current.addAction({
                id: "endOfPage",
                label: "Go To End Of Page",
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI,
                ],
                run: (editor) => {
                    if (!loadingLogs) {
                        onStateChange(STATE_CHANGE_TYPE.lineNumber, {
                            lineNumber: editor.getModel().getLineCount(),
                            columnNumber: 1,
                        });
                    }
                },
            });
        }
    }, [logFileState, loadingLogs]);

    const goToLine = (lineNumber, columnNumber) => {
        editorRef.current.revealLineInCenter(lineNumber);
        editorRef.current.setPosition({
            column: columnNumber, lineNumber: lineNumber,
        });
        editorRef.current.focus();
    };

    useEffect(() => {
        if (null !== editorRef.current) {
            const currPos = editorRef.current.getPosition();
            const newLine = logFileState.lineNumber;
            const newColumn = logFileState.columnNumber;
            if (newLine !== currPos.lineNumber || newColumn !== currPos.column) {
                goToLine(logFileState.lineNumber, logFileState.columnNumber);
            }
        }
    }, [logFileState.lineNumber, logFileState.columnNumber]);

    useEffect(() => {
        if (null !== editorRef.current && undefined !== logData) {
            editorRef.current.setValue(logData);
            goToLine(logFileState.lineNumber, logFileState.columnNumber);
        }
    }, [logData]);

    useEffect(() => {
        monaco.editor.setTheme(getMonacoThemeName(theme));
    }, [theme]);

    // Shortcut for focusing on the monaco editor and to enable
    // keyboard shortcuts
    const handleKeyDown = (e) => {
        if (e.key === "`") {
            e.stopPropagation();
            e.preventDefault();
            editorRef.current.focus();
        }
    };

    useEffect(() => {
        window.addEventListener("keypress", handleKeyDown);
        return () => {
            window.removeEventListener("keypress", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (null === editorRef.current) {
            _beforeMount();
            editorRef.current = monaco.editor.create(editorContainerRef.current, {
                language: "logLanguage",
                readOnly: true,
                renderWhitespace: "none",
                scrollBeyondLastLine: false,
                theme: getMonacoThemeName(theme),
                wordWrap: "on",
            });
            _onMount();
        }
    }, []);

    return (
        <div className="monaco-container" ref={editorContainerRef}></div>
    );
}

export default MonacoInstance;
