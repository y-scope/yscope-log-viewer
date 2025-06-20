import {StateCreator} from "zustand";

import {
    QueryConfigSlice,
    QueryConfigValues,
    QueryState,
} from "./types";


const QUERY_CONFIG_DEFAULT: QueryConfigValues = {
    queryIsCaseSensitive: false,
    queryIsRegex: false,
    queryString: "",
    resultButtonClickSignal: false,
    resultSelection: -1,
};

/**
 * Creates a slice for handling query options.
 *
 * @param set
 * @return
 */
const createQueryConfigSlice: StateCreator<
    QueryState, [], [], QueryConfigSlice
> = (set) => ({
    ...QUERY_CONFIG_DEFAULT,
    notifyResultButtonClick: (clickState) => {
        set({resultButtonClickSignal: clickState});
        if (!clickState) {
            set({resultSelection: -1});
        }
    },
    setQueryIsCaseSensitive: (newQueryIsCaseSensitive) => {
        set({queryIsCaseSensitive: newQueryIsCaseSensitive});
    },
    setQueryIsRegex: (newQueryIsRegex) => {
        set({queryIsRegex: newQueryIsRegex});
    },
    setQueryString: (newQueryString) => {
        set({queryString: newQueryString});
    },
    setResultSelection: (newResultSelection) => {
        set({resultSelection: newResultSelection});
    },
});

export {
    createQueryConfigSlice,
    QUERY_CONFIG_DEFAULT,
};
