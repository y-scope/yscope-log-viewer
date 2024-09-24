enum TAB_NAME {
    NONE = "none",
    FILE_INFO = "fileInfo",
    SETTINGS = "settings",
}

/**
 * Maps the TAB_NAME enum values to their corresponding display names.
 */
const TAB_DISPLAY_NAMES: Record<TAB_NAME, string> = Object.freeze({
    [TAB_NAME.NONE]: "None",
    [TAB_NAME.FILE_INFO]: "File info",
    [TAB_NAME.SETTINGS]: "Settings",
});

export {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
};
