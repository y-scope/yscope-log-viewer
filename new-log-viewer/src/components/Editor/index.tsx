import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    updateWindowUrlHashParams,
    UrlContext,
} from "../../contexts/UrlContextProvider";
import {Nullable} from "../../typings/common";
import {CONFIG_KEY} from "../../typings/config";
import {BeginLineNumToLogEventNumMap} from "../../typings/worker";
import {
    ACTION_NAME,
    EDITOR_ACTIONS,
    handleAction,
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
 * Renders a read-only editor for viewing logs.
 *
 * @return
 */
const Editor = () => {
    const {beginLineNumToLogEventNum, logData, numEvents} = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const [lineNum, setLineNum] = useState<number>(1);
    const beginLineNumToLogEventNumRef = useRef<BeginLineNumToLogEventNumMap>(
        beginLineNumToLogEventNum
    );
    const editorRef = useRef<Nullable<monaco.editor.IStandaloneCodeEditor>>(null);
    const isMouseDownRef = useRef<boolean>(false);
    const logEventNumRef = useRef<Nullable<number>>(logEventNum);
    const numEventsRef = useRef<Nullable<number>>(numEvents);
    const pageSizeRef = useRef(getConfig(CONFIG_KEY.PAGE_SIZE));

    const handleEditorCustomAction = useCallback((
        editor: monaco.editor.IStandaloneCodeEditor,
        actionName: ACTION_NAME
    ) => {
        if (null === logEventNumRef.current || null === numEventsRef.current) {
            return;
        }
        switch (actionName) {
            case ACTION_NAME.FIRST_PAGE:
            case ACTION_NAME.PREV_PAGE:
            case ACTION_NAME.NEXT_PAGE:
            case ACTION_NAME.LAST_PAGE:
                handleAction(actionName, logEventNumRef.current, numEventsRef.current);
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
            default:
                break;
        }
    }, []);

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
    }, []);

    /**
     * Resets the cached page size in case it causes a client OOM. If it doesn't, the saved value
     * will be restored when {@link restoreCachedPageSize} is called.
     */
    const resetCachedPageSize = useCallback(() => {
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

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

    // Synchronize `numEventsRef` with `numEvents`.
    useEffect(() => {
        numEventsRef.current = numEvents;
    }, [numEvents]);

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
                onCursorExplicitPosChange={handleCursorExplicitPosChange}
                onCustomAction={handleEditorCustomAction}
                onMount={handleMount}
                onTextUpdate={restoreCachedPageSize}/>
        </div>
    );
};

export default Editor;
