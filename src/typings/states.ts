/**
 * Various states of the UI. UI components may be enabled or disabled based on the state.
 */
enum UI_STATE {

    /**
     * When there is no file opened in the viewer.
     */
    UNOPENED,

    /**
     * When a file load request is pending response.
     */
    FILE_LOADING,

    /**
     * When a fast request is pending response. In this state, UI elements are not visually
     * disabled but instead ignore pointer events. Rapidly disabling/enabling UI elements is
     * jarring to the user.
     */
    FAST_LOADING,

    /**
     * When a slow request is pending response.
     */
    SLOW_LOADING,

    /**
     * When the file is loaded.
     */
    READY,
}

/**
 * Stateful elements in the UI.
 */
enum UI_ELEMENT {
    DRAG_AND_DROP,
    EXPORT_LOGS_BUTTON,
    LOG_EVENT_NUM_DISPLAY,
    LOG_LEVEL_FILTER,
    NAVIGATION_BAR,
    OPEN_FILE_BUTTON,
    PROGRESS_BAR,
    QUERY_INPUT_BOX,
}

type UiElementRow = {
    [key in UI_ELEMENT]: boolean;
};

type UiStateGrid = {
    [key in UI_STATE]: UiElementRow;
};

/**
 * Grid describing whether a `UI_ELEMENT` is enabled or disabled for every `UI_STATE`. Each
 * `UI_STATE` has its own row with a boolean for each `UI_ELEMENT`. Boolean is `true` if the
 * element is enabled, or `false` if disabled.
 */
const UI_STATE_GRID: UiStateGrid = Object.freeze({
    [UI_STATE.UNOPENED]: {
        [UI_ELEMENT.DRAG_AND_DROP]: true,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: false,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: false,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: false,
        [UI_ELEMENT.NAVIGATION_BAR]: false,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: true,
        [UI_ELEMENT.PROGRESS_BAR]: false,
        [UI_ELEMENT.QUERY_INPUT_BOX]: false,
    },
    [UI_STATE.FILE_LOADING]: {
        [UI_ELEMENT.DRAG_AND_DROP]: false,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: false,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: false,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: false,
        [UI_ELEMENT.NAVIGATION_BAR]: false,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: false,
        [UI_ELEMENT.PROGRESS_BAR]: true,
        [UI_ELEMENT.QUERY_INPUT_BOX]: false,
    },
    [UI_STATE.FAST_LOADING]: {
        [UI_ELEMENT.DRAG_AND_DROP]: true,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: true,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: true,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: true,
        [UI_ELEMENT.NAVIGATION_BAR]: true,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: true,
        [UI_ELEMENT.PROGRESS_BAR]: true,
        [UI_ELEMENT.QUERY_INPUT_BOX]: false,
    },
    [UI_STATE.SLOW_LOADING]: {
        [UI_ELEMENT.DRAG_AND_DROP]: false,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: false,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: true,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: false,
        [UI_ELEMENT.NAVIGATION_BAR]: false,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: false,
        [UI_ELEMENT.PROGRESS_BAR]: false,
        [UI_ELEMENT.QUERY_INPUT_BOX]: false,
    },
    [UI_STATE.READY]: {
        [UI_ELEMENT.DRAG_AND_DROP]: true,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: true,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: true,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: true,
        [UI_ELEMENT.NAVIGATION_BAR]: true,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: true,
        [UI_ELEMENT.PROGRESS_BAR]: false,
        [UI_ELEMENT.QUERY_INPUT_BOX]: true,
    },
});

export {
    UI_ELEMENT,
    UI_STATE,
    UI_STATE_GRID,
};
