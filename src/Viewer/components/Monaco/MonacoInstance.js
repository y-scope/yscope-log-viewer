import React, {useContext, useEffect, useRef, useState} from "react";
import { MyMonacoEditor } from "./MyMonacoEditor";

import Editor from "@monaco-editor/react";
import * as Monaco from "monaco-editor";
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
 * @param {object} monaco
 */

/**
 * Callback that gets called AFTER the Monaco Editor is mounted
 * @callback MountCallback
 * @param {object} editor
 * @param {object} monaco
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
    const monacoRef = useRef(null);
    const timeoutRef = useRef(null);
    const [monacoTheme, setMonacoTheme] = useState("customLogLanguageLight");

    const [language, setLanguage] = useState("");

    /**
     * Called before the monaco editor is mounted.
     *
     * @param {object} monaco
     */
    function handleEditorWillMount (monaco) {
        beforeMount(monaco);

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
        setLanguage("logLanguage");
    }


    /**
     * Called when editor is finished mounting.
     *
     * @param {object} editor
     * @param {object} monaco
     */
    const handleEditorDidMount =(editor, monaco) => {
        monacoRef.current = monaco;
        editorRef.current = editor;
        editor.setValue(logData);
        editor.revealLine(logFileState.lineNumber, 1);
        editor.setPosition({column: 1, lineNumber: logFileState.lineNumber});
        editor.focus();
        editor.onDidChangeCursorPosition((e) => {
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

        onMount(editor, monaco);
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
                    Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyU,
                ],
                run: () => {
                    if (!loadingLogs) {
                        onStateChange( STATE_CHANGE_TYPE.lineNumber, {
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
                    Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyI,
                ],
                run: (editor) => {
                    if (!loadingLogs) {
                        onStateChange( STATE_CHANGE_TYPE.lineNumber, {
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
        if (editorRef && editorRef.current) {
            const currPos = editorRef.current.getPosition();
            const newLine = logFileState.lineNumber;
            const newColumn = logFileState.columnNumber;
            if (newLine !== currPos.lineNumber || newColumn !== currPos.column) {
                goToLine(logFileState.lineNumber, logFileState.columnNumber);
            }
        }
    }, [logFileState.lineNumber, logFileState.columnNumber]);

    useEffect(() => {
        if (null != editorRef.current && undefined !== logData) {
            editorRef.current.setValue(logData);
            goToLine(logFileState.lineNumber, logFileState.columnNumber);
        }
    }, [logData]);

    useEffect(() => {
        setMonacoTheme((theme === THEME_STATES.LIGHT)
            ?"customLogLanguageLight"
            :"customLogLanguageDark");
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

    const monacoOptions = {
        "readOnly": true,
        "renderWhitespace": "none",
        "wordWrap": "on",
        "scrollBeyondLastLine": false,
    };

    return (<div style={{ display: 'flex' }}>
        <div style={{ width: '50vw', height: '80vh' }}>
            <Editor
                defaultValue="Loading content..."
                theme={monacoTheme}
                language={language}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={monacoOptions}
            />
        </div>
        <div style={{ width: '50vw', left: '50vw', height: '80vh', background: 'white' }}>
            <MyMonacoEditor
                options={monacoOptions}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
            />
        </div>
    </div>

    );
}

export default MonacoInstance;
