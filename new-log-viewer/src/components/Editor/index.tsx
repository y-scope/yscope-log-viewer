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
import {EDITOR_ACTIONS} from "../../utils/actions";
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
import {CustomActionCallback} from "./MonacoInstance/typings";


interface EditorProps {
    onCustomAction: CustomActionCallback,
}

/**
 * Renders a read-only editor for viewing logs.
 *
 * @param props
 * @param props.onCustomAction
 * @return
 */
const Editor = ({onCustomAction}: EditorProps) => {
    const {logData, beginLineNumToLogEventNum} = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const [lineNum, setLineNum] = useState<number>(1);
    const beginLineNumToLogEventNumRef = useRef<BeginLineNumToLogEventNumMap>(
        beginLineNumToLogEventNum
    );
    const editorRef = useRef<Nullable<monaco.editor.IStandaloneCodeEditor>>(null);
    const isMouseDownRef = useRef<boolean>(false);
    const pageSizeRef = useRef(getConfig(CONFIG_KEY.PAGE_SIZE));

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

    // On `logEventNum` update, update line number in the editor.
    useEffect(() => {
        if (null === editorRef.current || true === isMouseDownRef.current) {
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
        <MonacoInstance
            actions={EDITOR_ACTIONS}
            beforeTextUpdate={resetCachedPageSize}
            lineNum={lineNum}
            text={logData}
            onCursorExplicitPosChange={handleCursorExplicitPosChange}
            onCustomAction={onCustomAction}
            onMount={handleMount}
            onTextUpdate={restoreCachedPageSize}/>
    );
};

export default Editor;
