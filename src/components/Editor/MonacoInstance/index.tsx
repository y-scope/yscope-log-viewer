import {
    useEffect,
    useRef,
} from "react";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import {EditorAction} from "../../../utils/actions";
import {
    BeforeMountCallback,
    BeforeTextUpdateCallback,
    CursorExplicitPosChangeCallback,
    CustomActionCallback,
    MountCallback,
    TextUpdateCallback,
} from "./typings";
import {
    createMonacoEditor,
    goToPositionAndCenter,
} from "./utils";

import "./index.css";


interface MonacoEditorProps {
    actions: EditorAction[],
    lineNum: number,
    text: string,
    themeName: "dark" | "light",

    beforeMount?: BeforeMountCallback,
    beforeTextUpdate?: BeforeTextUpdateCallback,
    onCursorExplicitPosChange: CursorExplicitPosChangeCallback,
    onCustomAction: CustomActionCallback,
    onMount?: MountCallback,
    onTextUpdate?: TextUpdateCallback,
}

/**
 * Wraps a `monaco-editor` instance for viewing text content. The component accepts a variety of
 * props to configure the content, custom actions, and various lifecycle hooks for interacting with
 * the editor.
 *
 * @param props
 * @param props.actions
 * @param props.lineNum
 * @param props.text
 * @param props.themeName
 * @param props.beforeMount
 * @param props.beforeTextUpdate
 * @param props.onCursorExplicitPosChange
 * @param props.onCustomAction
 * @param props.onMount
 * @param props.onTextUpdate
 * @return
 */
const MonacoInstance = ({
    actions,
    lineNum,
    text,
    themeName,
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
        console.log("Initiating Monaco instance");
        if (null === editorContainerRef.current) {
            console.error("Unexpected unmounted editor container div element");

            return () => null;
        }

        beforeMount?.();
        editorRef.current = createMonacoEditor(editorContainerRef.current, actions, {
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

    // On `themeName` update, set the theme in the editor.
    useEffect(() => {
        monaco.editor.setTheme(themeName);
    }, [themeName]);

    // On `text` update, set the text and position cursor in the editor.
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

    // On `lineNum` update, update the cursor's position in the editor.
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

export default MonacoInstance;
