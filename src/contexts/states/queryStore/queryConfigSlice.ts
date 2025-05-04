import {StateCreator} from "zustand";

import {
    QueryConfigSlice,
    QueryState,
} from "./types";


const QUERY_CONFIG_DEFAULT = {
    queryIsCaseSensitive: false,
    queryIsRegex: false,
    queryString: "",
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
    setQueryIsCaseSensitive: (newQueryIsCaseSensitive) => {
        set({queryIsCaseSensitive: newQueryIsCaseSensitive});
    },
    setQueryIsRegex: (newQueryIsRegex) => {
        set({queryIsRegex: newQueryIsRegex});
    },
    setQueryString: (newQueryString) => {
        set({queryString: newQueryString});
    },
});

export {
    createQueryConfigSlice,
    QUERY_CONFIG_DEFAULT,
};
