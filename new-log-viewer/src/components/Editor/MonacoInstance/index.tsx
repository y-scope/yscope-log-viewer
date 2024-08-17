import {
    useEffect,
    useRef,
} from "react";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import {ActionType} from "../../../utils/actions";
import {
    CursorExplicitPosChangeCallback,
    CustomActionCallback,
} from "./typings";
import {
    goToPositionAndCenter,
    initMonacoEditor,
} from "./utils";

import "./index.css";


interface MonacoEditorProps {
    lineNum: number,
    text: string,
    actions: ActionType[],
    beforeMount?: () => void,
    beforeTextUpdate?: (editor: monaco.editor.IStandaloneCodeEditor) => void,
    onCursorExplicitPosChange: CursorExplicitPosChangeCallback,
    onCustomAction: CustomActionCallback,
    onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void,
    onTextUpdate?: (editor: monaco.editor.IStandaloneCodeEditor) => void,
}

/**
 * Wraps a `monaco-editor` instance created from the DOM rendered, which accepts a variety of props
 * to configure text content, custome actions, and various lifecycle hooks for interacting with
 * the editor.
 *
 * @param props
 * @param props.text
 * @param props.lineNum
 * @param props.actions
 * @param props.beforeMount
 * @param props.beforeTextUpdate
 * @param props.onCursorExplicitPosChange
 * @param props.onCustomAction
 * @param props.onMount
 * @param props.onTextUpdate
 * @return
 */
const MonacoEditor = ({
    lineNum,
    text,
    actions,
    beforeMount,
    beforeTextUpdate,
    onMount,
    onCursorExplicitPosChange,
    onCustomAction,
    onTextUpdate,
}: MonacoEditorProps) => {
    const editorRef = useRef<null|monaco.editor.IStandaloneCodeEditor>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const lineNumRef = useRef<number>(lineNum);

    // Synchronize `lineNumRef` with `lineNum`.
    useEffect(() => {
        lineNumRef.current = lineNum;
    }, [lineNum]);

    useEffect(() => {
        console.log("Initiating monaco instance");
        if (null === editorContainerRef.current) {
            console.error("Unexpected unmounted editor container div element");

            return () => null;
        }

        beforeMount?.();
        editorRef.current = initMonacoEditor(editorContainerRef.current, actions, {
            onCursorExplicitPosChange: onCursorExplicitPosChange,
            onCustomAction: onCustomAction,
        });
        onMount?.(editorRef.current);

        return () => {
            editorRef.current?.dispose();
            editorRef.current = null;
        };
    }, [
        actions,
        beforeMount,
        onCursorExplicitPosChange,
        onCustomAction,
        onMount,
    ]);

    useEffect(() => {
        if (null === editorRef.current) {
            return;
        }
        beforeTextUpdate?.(editorRef.current);
        editorRef.current.setValue(text);
        goToPositionAndCenter(editorRef.current, {lineNumber: lineNumRef.current, column: 1});
        onTextUpdate?.(editorRef.current);
    }, [
        text,
        beforeTextUpdate,
        onTextUpdate,
    ]);

    useEffect(() => {
        if (null === editorRef.current) {
            return;
        }
        goToPositionAndCenter(editorRef.current, {lineNumber: lineNum, column: 1});
    }, [lineNum]);

    return (
        <div
            className={"monaco-container"}
            ref={editorContainerRef}/>
    );
};

export default MonacoEditor;
