import {create} from "zustand";

import createQueryControllerSlice from "./createQueryControllerSlice";
import {createQueryResultsSlice} from "./createQueryResultsSlice";
import {createQueryConfigSlice} from "./queryConfigSlice";
import {QueryState} from "./types";


const useQueryStore = create<QueryState>((...args) => ({
    ...createQueryConfigSlice(...args),
    ...createQueryControllerSlice(...args),
    ...createQueryResultsSlice(...args),
}));

export default useQueryStore;
