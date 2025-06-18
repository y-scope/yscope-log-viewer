import {LogLevelFilter} from "../../typings/logs.ts";
import {
    BeginLineNumToLogEventNumMap,
    PageData,
} from "../../typings/worker.ts";
import {NavigationAction} from "../../utils/actions.ts";


interface ViewValues {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    isPrettified: boolean;
    logData: string;
    logEventNum: number;
    numPages: number;
    pageNum: number;
}

interface ViewUpdateActions {
    setBeginLineNumToLogEventNum: (newMap: BeginLineNumToLogEventNumMap) => void;
    setLogData: (newLogData: string) => void;
    setNumPages: (newNumPages: number) => void;
    setPageNum: (newPageNum: number) => void;

    updateLogEventNum: (newLogEventNum: number) => void;
    updateIsPrettified: (newIsPrettified: boolean) => void;
    updatePageData: (pageData: PageData) => void;
}

type ViewUpdateSlice = ViewValues & ViewUpdateActions;

interface ViewUtilitySlice {
    filterLogs: (filter: LogLevelFilter) => void;
    loadPageByAction: (navAction: NavigationAction) => void;
}

type ViewState = ViewUpdateSlice & ViewUtilitySlice;

export type {
    ViewState,
    ViewUpdateActions,
    ViewUpdateSlice,
    ViewUtilitySlice,
    ViewValues,
};
