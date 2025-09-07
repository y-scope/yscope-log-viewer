import {create} from "zustand";

import {createQueryConfigSlice} from "./createQueryConfigSlice";
import createQueryControllerSlice from "./createQueryControllerSlice";
import {createQueryResultsSlice} from "./createQueryResultsSlice";
import {QueryState} from "./types";


const useQueryStore = create<QueryState>((...args) => ({
    ...createQueryConfigSlice(...args),
    ...createQueryControllerSlice(...args),
    ...createQueryResultsSlice(...args),
}));

export default useQueryStore;
