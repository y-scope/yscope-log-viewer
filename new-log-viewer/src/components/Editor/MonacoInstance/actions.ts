import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import {Nullable} from "../../../typings/common";
import {ActionType} from "../../../utils/actions";
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
 * Sets up an action that is triggered when the cursor position changes in a Monaco code editor.
 *
 * @param editor
 * @param onCursorExplicitPosChange
 */
const setupCursorExplicitPosChangeAction = (
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
 * @param touch1
 * @param touch2
 * @return The Euclidean distance between the touch points.
 */
const getTouchDistance = (touch1: Touch, touch2: Touch): number => Math.sqrt(
    ((touch2.pageX - touch1.pageX) ** 2) + ((touch2.pageY - touch1.pageY) ** 2)
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

    const initialDistanceRef: {current: Nullable<number>} = {current: null};
    editorContainer.addEventListener("touchstart", (e) => {
        const [touch0, touch1] = e.touches;

        if (2 !== e.touches.length ||
            "undefined" === typeof touch0 ||
            "undefined" === typeof touch1) {
            return;
        }

        e.preventDefault();
        initialDistanceRef.current = getTouchDistance(touch0, touch1);
    }, {passive: false});

    editorContainer.addEventListener("touchmove", (e) => {
        const [touch0, touch1] = e.touches;
        if (2 !== e.touches.length ||
            "undefined" === typeof touch0 ||
            "undefined" === typeof touch1 ||
            null === initialDistanceRef.current) {
            return;
        }
        e.preventDefault();

        const newDistance = getTouchDistance(touch0, touch1);
        let newZoomLevel = (newDistance > initialDistanceRef.current) ?
            monaco.editor.EditorZoom.getZoomLevel() + MOBILE_ZOOM_LEVEL_INCREMENT :
            monaco.editor.EditorZoom.getZoomLevel() - MOBILE_ZOOM_LEVEL_DECREMENT;

        newZoomLevel = clamp(
            newZoomLevel,
            MIN_ZOOM_LEVEL,
            MAX_ZOOM_LEVEL
        );
        initialDistanceRef.current = newDistance;
        monaco.editor.EditorZoom.setZoomLevel(newZoomLevel);
    }, {passive: false});

    editorContainer.addEventListener("touchend", () => {
        initialDistanceRef.current = null;
    });
};

/**
 * Sets up custom actions for a monaco editor.
 *
 * @param editor
 * @param actions
 * @param onCustomAction
 */
const setupCustomActions = (
    editor: monaco.editor.IStandaloneCodeEditor,
    actions: ActionType[],
    onCustomAction: CustomActionCallback
) => {
    actions.forEach(({action, label, keybindings}) => {
        if (null === action) {
            return;
        }
        editor.addAction({
            id: action,
            label: label,
            keybindings: keybindings,
            run: () => {
                onCustomAction(editor, action);
            },
        });
    });
};

export {
    setupCursorExplicitPosChangeAction,
    setupCustomActions,
    setupFocusOnBacktickDown,
    setupMobileZoom,
};
