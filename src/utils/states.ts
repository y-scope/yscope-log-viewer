import {
    UI_ELEMENT,
    UI_STATE,
    UI_STATE_GRID,
} from "../typings/states";


/**
 * Whether a UI element is disabled based on provided state.
 *
 * @param uiState
 * @param uiElement
 * @return `true` if the element is disabled, `false` otherwise.
 */
const isDisabled = (uiState: UI_STATE, uiElement: UI_ELEMENT): boolean => (
    false === UI_STATE_GRID[uiState][uiElement]
);

/**
 * Returns a CSS class that ignores pointer events if in fast loading state.
 *
 * @param uiState
 * @return Ignore pointer class name or an empty string.
 */
const ignorePointerIfFastLoading = (uiState: UI_STATE): string => (
    uiState === UI_STATE.FAST_LOADING ?
        "disable-pointer-events" :
        ""
);

export {
    ignorePointerIfFastLoading,
    isDisabled,
};
