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
     * When a slow request is pending pending response.
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
    PROGRESS_BAR,
    NAVIGATION_BAR,
    OPEN_FILE_BUTTON,
    LOG_LEVEL_FILTER,
    EXPORT_LOGS_BUTTON,
    LOG_EVENT_NUM_DISPLAY,
    DRAG_AND_DROP,
}

type uiElementRow = {
    [key in UI_ELEMENT]: boolean;
};

type uiStateGrid = {
    [key in UI_STATE]: uiElementRow;
};

/**
 * Grid describing whether a `UI_ELEMENT` is enabled or disabled for every `UI_STATE`. Each
 * `UI_STATE` has its own row with a boolean for each `UI_ELEMENT`. Boolean is `true` if the
 * element is enabled, or `false` if disabled.
 */
const uiStateGrid: uiStateGrid = Object.freeze({
    [UI_STATE.UNOPENED]: {
        [UI_ELEMENT.PROGRESS_BAR]: false,
        [UI_ELEMENT.NAVIGATION_BAR]: false,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: true,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: false,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: false,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: false,
        [UI_ELEMENT.DRAG_AND_DROP]: true,
    },
    [UI_STATE.FILE_LOADING]: {
        [UI_ELEMENT.PROGRESS_BAR]: true,
        [UI_ELEMENT.NAVIGATION_BAR]: false,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: false,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: false,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: false,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: false,
        [UI_ELEMENT.DRAG_AND_DROP]: false,
    },
    [UI_STATE.SLOW_LOADING]: {
        [UI_ELEMENT.PROGRESS_BAR]: false,
        [UI_ELEMENT.NAVIGATION_BAR]: false,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: false,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: false,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: false,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: true,
        [UI_ELEMENT.DRAG_AND_DROP]: false,
    },
    [UI_STATE.READY]: {
        [UI_ELEMENT.PROGRESS_BAR]: false,
        [UI_ELEMENT.NAVIGATION_BAR]: true,
        [UI_ELEMENT.OPEN_FILE_BUTTON]: true,
        [UI_ELEMENT.LOG_LEVEL_FILTER]: true,
        [UI_ELEMENT.EXPORT_LOGS_BUTTON]: true,
        [UI_ELEMENT.LOG_EVENT_NUM_DISPLAY]: true,
        [UI_ELEMENT.DRAG_AND_DROP]: true,
    },
});


/**
 * Whether a UI element is disabled based on provided state.
 *
 * @param state
 * @param UiComponent
 * @return `true` if the element is disabled, `false` otherwise.
 */
const isDisabled = (state: UI_STATE, UiComponent: UI_ELEMENT): boolean => {
    return false === uiStateGrid[state][UiComponent];
};

export {
    isDisabled,
    UI_ELEMENT,
    UI_STATE,
};
