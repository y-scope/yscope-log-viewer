import {create} from "zustand";
import {
    persist,
    PersistStorage,
} from "zustand/middleware";

import {handleErrorWithNotification} from "../notificationStore.ts";
import createViewEventSlice from "./createViewEventSlice";
import createViewFilterSlice from "./createViewFilterSlice";
import createViewFormattingSlice from "./createViewFormattingSlice";
import createViewPageSlice from "./createViewPageSlice";
import {
    ViewEventValues,
    ViewFormattingValues,
    ViewState,
} from "./types";


type UrlHashParams = ViewEventValues & ViewFormattingValues;


const hashParamsStorage: PersistStorage<UrlHashParams> = {
    getItem: () => {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const state = {
            isPrettified: "true" === hashParams.get("isPrettified"),
            logEventNum: Number(hashParams.get("logEventNum")) || 0,
        };

        return {state};
    },
    setItem: (_, value) => {
        const hashParams = new URLSearchParams(location.hash.slice(1));
        hashParams.set("isPrettified", value.state.isPrettified.toString());
        hashParams.set("logEventNum", value.state.logEventNum.toString());
        location.hash = hashParams.toString();
    },
    removeItem: () => {
    },
};

const useViewStore = create<ViewState>()(
    persist(
        (...args) => ({
            ...createViewEventSlice(...args),
            ...createViewFilterSlice(...args),
            ...createViewFormattingSlice(...args),
            ...createViewPageSlice(...args),
        }),
        {
            name: "view-store",
            partialize: (state) => ({
                isPrettified: state.isPrettified,
                logEventNum: state.logEventNum,
            }),
            storage: hashParamsStorage,
        }
    )
);

window.addEventListener("hashchange", () => {
    (async () => {
        await useViewStore.persist.rehydrate();
    })().catch(handleErrorWithNotification);
});

export default useViewStore;
