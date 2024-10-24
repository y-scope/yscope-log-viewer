import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {Nullable} from "../../../typings/common";
import {EditorAction} from "../../../utils/actions";
import {clamp} from "../../../utils/math";
import type {
    CursorExplicitPosChangeCallback,
    CustomActionCallback,
} from "./typings";


const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 10;
const MOBILE_ZOOM_LEVEL_INCREMENT = 10;
const MOBILE_ZOOM_LEVEL_DECREMENT = 1;
const POSITION_CHANGE_DEBOUNCE_TIMEOUT_MILLIS = 50;

/**
 * Sets up a callback for when the cursor position changes in the editor.
 *
 * @param editor
 * @param onCursorExplicitPosChange
 */
const setupCursorExplicitPosChangeCallback = (
    editor: monaco.editor.IStandaloneCodeEditor,
    onCursorExplicitPosChange: CursorExplicitPosChangeCallback
) => {
    let posChangeDebounceTimeout: Nullable<ReturnType<typeof setTimeout>> = null;

    editor.onDidChangeCursorPosition((ev: monaco.editor.ICursorPositionChangedEvent) => {
        // only trigger if there was an explicit change that was made by keyboard or mouse
        if (monaco.editor.CursorChangeReason.Explicit !== ev.reason) {
            return;
        }
        if (null !== posChangeDebounceTimeout) {
            clearTimeout(posChangeDebounceTimeout);
        }
        posChangeDebounceTimeout = setTimeout(() => {
            onCursorExplicitPosChange(ev);
            posChangeDebounceTimeout = null;
        }, POSITION_CHANGE_DEBOUNCE_TIMEOUT_MILLIS);
    });
};

/**
 * Sets up editor focus on `backtick` key down.
 *
 * @param editor
 */
const setupFocusOnBacktickDown = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ("`" === e.key) {
            e.stopPropagation();
            e.preventDefault();
            editor.focus();
        }
    };

    window.addEventListener("keypress", handleKeyDown);
    editor.onDidDispose(() => {
        window.removeEventListener("keypress", handleKeyDown);
    });
};

/**
 * Calculates the distance between two touch points.
 *
 * @param touch0
 * @param touch1
 * @return The Euclidean distance between the touch points.
 */
const getTouchDistance = (touch0: Touch, touch1: Touch): number => Math.sqrt(
    ((touch1.pageX - touch0.pageX) ** 2) + ((touch1.pageY - touch0.pageY) ** 2)
);

/**
 * Sets up mobile zoom functionality by calculating distance differences between two touch points.
 *
 * @param editor
 * @param editorContainer
 */
const setupMobileZoom = (
    editor: monaco.editor.IStandaloneCodeEditor,
    editorContainer: HTMLElement
) => {
    const editorDomNode = editor.getDomNode();
    if (null === editorDomNode) {
        console.error("Unexpected null returned by editor.getDomNode()");

        return;
    }

    // NOTE:
    // - We explicitly set `passive=false` for the listeners below since, on Safari, it defaults to
    //   `true` for touch events (whereas it defaults to `false` otherwise).
    // - The "undefined" type checks below are to satisfy TypeScript.
    // - We only call `e.preventDefault()` after we validate that this is a two-touch event, to
    //   avoid affecting other touch events.

    const currDistanceRef: {current: Nullable<number>} = {current: null};
    editorContainer.addEventListener("touchstart", (e) => {
        const [touch0, touch1] = e.touches;

        if (2 !== e.touches.length ||
            "undefined" === typeof touch0 ||
            "undefined" === typeof touch1) {
            return;
        }

        e.preventDefault();

        currDistanceRef.current = getTouchDistance(touch0, touch1);
    }, {passive: false});

    editorContainer.addEventListener("touchmove", (e) => {
        const [touch0, touch1] = e.touches;

        if (2 !== e.touches.length ||
            "undefined" === typeof touch0 ||
            "undefined" === typeof touch1 ||
            null === currDistanceRef.current) {
            return;
        }

        e.preventDefault();

        const newDistance = getTouchDistance(touch0, touch1);
        let newZoomLevel = (newDistance > currDistanceRef.current) ?
            monaco.editor.EditorZoom.getZoomLevel() + MOBILE_ZOOM_LEVEL_INCREMENT :
            monaco.editor.EditorZoom.getZoomLevel() - MOBILE_ZOOM_LEVEL_DECREMENT;

        newZoomLevel = clamp(
            newZoomLevel,
            MIN_ZOOM_LEVEL,
            MAX_ZOOM_LEVEL
        );
        currDistanceRef.current = newDistance;
        monaco.editor.EditorZoom.setZoomLevel(newZoomLevel);
    }, {passive: false});

    editorContainer.addEventListener("touchend", () => {
        currDistanceRef.current = null;
    });
};

/**
 * Sets up custom actions for the editor.
 *
 * @param editor
 * @param actions
 * @param onCustomAction
 */
const setupCustomActions = (
    editor: monaco.editor.IStandaloneCodeEditor,
    actions: EditorAction[],
    onCustomAction: CustomActionCallback
) => {
    actions.forEach(({actionName, label, keyBindings}) => {
        if (null === actionName) {
            return;
        }
        editor.addAction({
            id: actionName,
            label: label,
            keybindings: keyBindings,
            run: () => {
                onCustomAction(editor, actionName);
            },
        });
    });
};

export {
    setupCursorExplicitPosChangeCallback,
    setupCustomActions,
    setupFocusOnBacktickDown,
    setupMobileZoom,
};
