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

type StateRowType = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
type uiStateGridType = readonly [
    StateRowType,
    StateRowType,
    StateRowType,
    StateRowType,
];

/**
 * Grid describing whether a `UI_ELEMENT` is enabled or disabled for every `UI_STATE`. Each
 * `UI_STATE` has its own row with a boolean for each `UI_ELEMENT`. States and elements are
 * listed in the order of their corresponding enum.
 */
const uiStateGrid: uiStateGridType = Object.freeze(
    [
        [
            false,
            false,
            true,
            false,
            false,
            false,
            true,
        ],
        [
            true,
            false,
            false,
            false,
            false,
            false,
            false,
        ],
        [
            false,
            false,
            false,
            false,
            false,
            true,
            false,
        ],
        [
            false,
            true,
            true,
            true,
            true,
            true,
            true,
        ],
    ]
);

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
