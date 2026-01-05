enum ACTION_NAME {
    SPECIFIC_PAGE = "specificPage",
    FIRST_PAGE = "firstPage",
    PREV_PAGE = "prevPage",
    NEXT_PAGE = "nextPage",
    LAST_PAGE = "lastPage",
    PAGE_TOP = "pageTop",
    PAGE_BOTTOM = "pageBottom",
    RELOAD = "reload",
    COPY_LOG_EVENT = "copyLogEvent",
    TOGGLE_PRETTIFY = "togglePrettify",
    TOGGLE_WORD_WRAP = "toggleWordWrap",
}

type NavigationActionsMap = {
    [ACTION_NAME.SPECIFIC_PAGE]: {
        pageNum: number;
    };
    [ACTION_NAME.FIRST_PAGE]: null;
    [ACTION_NAME.PREV_PAGE]: null;
    [ACTION_NAME.NEXT_PAGE]: null;
    [ACTION_NAME.LAST_PAGE]: null;
    [ACTION_NAME.RELOAD]: null;
};

type NavigationAction = {
    [T in keyof NavigationActionsMap]:
    {
        code: T;
        args: NavigationActionsMap[T];
    }
} [keyof NavigationActionsMap];

export {ACTION_NAME};
export type {NavigationAction};
