/* eslint max-lines: ["error", 360] */
/* eslint max-lines-per-function: ["error", 220] */
/* eslint max-statements: ["error", 25] */
import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {useColorScheme} from "@mui/joy";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {
    updateWindowUrlHashParams,
    UrlContext,
} from "../../contexts/UrlContextProvider";
import useQueryStore from "../../stores/queryStore";
import useResultsStore from "../../stores/resultsStore";
import useViewStore from "../../stores/viewStore";
import {Nullable} from "../../typings/common";
import {
    CONFIG_KEY,
    THEME_NAME,
} from "../../typings/config";
import {HASH_PARAM_NAMES} from "../../typings/url";
import {BeginLineNumToLogEventNumMap} from "../../typings/worker";
import {
    ACTION_NAME,
    EDITOR_ACTIONS,
} from "../../utils/actions";
import {
    CONFIG_DEFAULT,
    getConfig,
    setConfig,
} from "../../utils/config";
import {
    getMapKeyByValue,
    getMapValueWithNearestLessThanOrEqualKey,
} from "../../utils/data";
import MonacoInstance from "./MonacoInstance";
import {goToPositionAndCenter} from "./MonacoInstance/utils";

import "./index.css";


/**
 * Gets the beginning line number of the log event selected by mouse in editor.
 *
 * @param editor
 * @param beginLineNumToLogEventNum
 * @return the beginning line number of the selected log event.
 */
const getSelectedLogEventNum = (
    editor: monaco.editor.IStandaloneCodeEditor,
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap
): Nullable<number> => {
    const selectedLineNum = editor.getPosition()?.lineNumber;
    if ("undefined" === typeof selectedLineNum) {
        return null;
    }

    return getMapValueWithNearestLessThanOrEqualKey(
        beginLineNumToLogEventNum,
        selectedLineNum
    );
};

/**
 * Handles copy log event action in the editor.
 *
 * @param editor
 * @param beginLineNumToLogEventNum
 * @throws {Error} if the editor's model cannot be retrieved.
 */
const handleCopyLogEventAction = (
    editor: monaco.editor.IStandaloneCodeEditor,
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap
) => {
    const selectedLogEventNum = getSelectedLogEventNum(
        editor,
        beginLineNumToLogEventNum,
    );

    if (null === selectedLogEventNum) {
        return;
    }
    const selectedLogEventLineNum =
        getMapKeyByValue(beginLineNumToLogEventNum, selectedLogEventNum);
    const nextLogEventLineNum =
        getMapKeyByValue(beginLineNumToLogEventNum, selectedLogEventNum + 1);

    if (null === selectedLogEventLineNum) {
        throw new Error("Unable to get the beginning line number of the selected log event.");
    }

    let endLineNumber: number;
    if (null !== nextLogEventLineNum) {
        endLineNumber = nextLogEventLineNum - 1;
    } else {
        // Handle the case when this is the last log event in the file.
        const model = editor.getModel();
        if (null === model) {
            throw new Error("Unable to get the text model.");
        }
        endLineNumber = model.getLineCount() - 1;
    }

    const selectionRange = new monaco.Range(
        selectedLogEventLineNum,
        0,
        endLineNumber,
        Infinity
    );

    editor.setSelection(selectionRange);
    editor.trigger(handleCopyLogEventAction.name, "editor.action.clipboardCopyAction", null);
};

/**
 * Toggles the word wrap setting in the editor between "on" and "off".
 *
 * @param editor
 */
const handleToggleWordWrapAction = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const currentWordWrap = editor.getRawOptions().wordWrap;
    const newWordWrap = "on" === currentWordWrap ?
        "off" :
        "on";

    editor.updateOptions({wordWrap: newWordWrap});
};

/**
 * Renders a read-only editor for viewing logs.
 *
 * @return
 */
const Editor = () => {
    const {mode, systemMode} = useColorScheme();

    const beginLineNumToLogEventNum = useViewStore((state) => state.beginLineNumToLogEventNum);
    const logData = useViewStore((state) => state.logData);
    const loadPageByAction = useViewStore((state) => state.loadPageByAction);
    const {isPrettified, logEventNum} = useContext(UrlContext);

    const [lineNum, setLineNum] = useState<number>(1);
    const beginLineNumToLogEventNumRef = useRef<BeginLineNumToLogEventNumMap>(
        beginLineNumToLogEventNum
    );
    const editorRef = useRef<Nullable<monaco.editor.IStandaloneCodeEditor>>(null);
    const isPrettifiedRef = useRef<boolean>(isPrettified ?? false);
    const isMouseDownRef = useRef<boolean>(false);
    const pageSizeRef = useRef(getConfig(CONFIG_KEY.PAGE_SIZE));

    const handleEditorCustomAction = useCallback((
        editor: monaco.editor.IStandaloneCodeEditor,
        actionName: ACTION_NAME
    ) => {
        switch (actionName) {
            case ACTION_NAME.FIRST_PAGE:
            case ACTION_NAME.PREV_PAGE:
            case ACTION_NAME.NEXT_PAGE:
            case ACTION_NAME.LAST_PAGE:
                loadPageByAction({code: actionName, args: null});
                break;
            case ACTION_NAME.PAGE_TOP:
                goToPositionAndCenter(editor, {lineNumber: 1, column: 1});
                break;
            case ACTION_NAME.PAGE_BOTTOM: {
                const lineCount = editor.getModel()?.getLineCount();
                if ("undefined" === typeof lineCount) {
                    break;
                }
                goToPositionAndCenter(editor, {lineNumber: lineCount, column: 1});
                break;
            }
            case ACTION_NAME.COPY_LOG_EVENT:
                handleCopyLogEventAction(editor, beginLineNumToLogEventNumRef.current);
                break;
            case ACTION_NAME.TOGGLE_PRETTIFY:
                updateWindowUrlHashParams({
                    [HASH_PARAM_NAMES.IS_PRETTIFIED]: !isPrettifiedRef.current,
                });
                break;
            case ACTION_NAME.TOGGLE_WORD_WRAP:
                handleToggleWordWrapAction(editor);
                break;
            default:
                break;
        }
    }, [loadPageByAction]);

    /**
     * Sets `editorRef` and configures callbacks for mouse down detection.
     */
    const handleMount = useCallback((
        editor: monaco.editor.IStandaloneCodeEditor
    ) => {
        editorRef.current = editor;
        editor.onMouseDown(() => {
            isMouseDownRef.current = true;
        });
        editor.onMouseUp(() => {
            isMouseDownRef.current = false;
        });

        // Update find action parameters when Zustand store changes
        const updateFindAction = async () => {
            const {queryString, queryIsCaseSensitive, queryIsRegex} = useQueryStore.getState();
            const findAction = editorRef.current.getAction("actions.find");
            const findWithArgsAction = editorRef.current.getAction("editor.actions.findWithArgs");

            if (findAction && findWithArgsAction) {
                try {
                    await findAction.run();
                    await findWithArgsAction.run({
                        searchString: queryString,
                        matchCase: queryIsCaseSensitive,
                        isRegex: queryIsRegex,
                    });
                } catch (error) {
                    console.error("Error during search:", error);
                }
            } else {
                console.error("Find action or Find with args action is not available.");
            }
        };

        const closeFind = () => {
            const findController = editorRef.current.getContribution(
                "editor.contrib.findController"
            ) as {closeFindWidget: () => void};

            findController.closeFindWidget();
        };

        useQueryStore.subscribe(() => {
            closeFind();
        });
        useResultsStore.subscribe((state) => {
            if (state.buttonClicked) {
                updateFindAction().catch((error: unknown) => {
                    console.error("Error during search:", error);
                });
            }
        });
    }, []);

    /**
     * Backs up the current page size and resets the cached page size in case it causes a client
     * OOM. If it doesn't, the saved value will be restored when {@link restoreCachedPageSize} is
     * called.
     */
    const resetCachedPageSize = useCallback(() => {
        pageSizeRef.current = getConfig(CONFIG_KEY.PAGE_SIZE);

        const error = setConfig(
            {key: CONFIG_KEY.PAGE_SIZE, value: CONFIG_DEFAULT[CONFIG_KEY.PAGE_SIZE]}
        );

        if (null !== error) {
            console.error(`Unexpected error returned by setConfig(): ${error}`);
        }
    }, []);

    /**
     * Restores the cached page size that was unset in {@link resetCachedPageSize};
     */
    const restoreCachedPageSize = useCallback(() => {
        const error = setConfig({key: CONFIG_KEY.PAGE_SIZE, value: pageSizeRef.current});

        if (null !== error) {
            console.error(`Unexpected error returned by setConfig(): ${error}`);
        }
    }, []);

    /**
     * On explicit position change of the cursor in the editor, get the `logEventNum` corresponding
     * to the line number at the cursor's position and update the URL parameter.
     *
     * @param ev The event object containing information about the cursor position change.
     */
    const handleCursorExplicitPosChange = useCallback((
        ev: monaco.editor.ICursorPositionChangedEvent
    ) => {
        const newLogEventNum = getMapValueWithNearestLessThanOrEqualKey(
            beginLineNumToLogEventNumRef.current,
            ev.position.lineNumber
        );

        if (null === newLogEventNum) {
            console.error(
                "Unable to find log event number corresponding to cursor:",
                `\`position.lineNumber\`=${ev.position.lineNumber}`
            );

            return;
        }
        updateWindowUrlHashParams({logEventNum: newLogEventNum});
    }, []);

    // Synchronize `beginLineNumToLogEventNumRef` with `beginLineNumToLogEventNum`.
    useEffect(() => {
        beginLineNumToLogEventNumRef.current = beginLineNumToLogEventNum;
    }, [beginLineNumToLogEventNum]);

    // Synchronize `isPrettifiedRef` with `isPrettified`.
    useEffect(() => {
        isPrettifiedRef.current = isPrettified ?? false;
    }, [isPrettified]);

    // On `logEventNum` update, update line number in the editor.
    useEffect(() => {
        if (null === editorRef.current || isMouseDownRef.current) {
            // Don't update the line number if the user is actively selecting text.
            return;
        }

        const logEventLineNum = getMapKeyByValue(beginLineNumToLogEventNum, logEventNum);
        if (null === logEventLineNum) {
            // Unable to find logEventLineNum from logEventNum because `beginLineNumToLogEventNum`
            // is either uninitialized or holds the value from the last loaded page.
            return;
        }

        setLineNum(logEventLineNum);
    }, [
        logEventNum,
        beginLineNumToLogEventNum,
    ]);

    return (
        <div className={"editor"}>
            <MonacoInstance
                actions={EDITOR_ACTIONS}
                beforeTextUpdate={resetCachedPageSize}
                lineNum={lineNum}
                text={logData}
                themeName={(("system" === mode) ?
                    systemMode :
                    mode) ?? THEME_NAME.DARK}
                onCursorExplicitPosChange={handleCursorExplicitPosChange}
                onCustomAction={handleEditorCustomAction}
                onMount={handleMount}
                onTextUpdate={restoreCachedPageSize}/>
        </div>
    );
};

export default Editor;
