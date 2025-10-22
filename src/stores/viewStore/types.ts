import {LogLevelFilter} from "../../typings/logs";
import {
    BeginLineNumToLogEventNumMap,
    CursorType,
    PageData,
} from "../../typings/worker";
import {NavigationAction} from "../../utils/actions";


interface ViewPageValues {
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap;
    logData: string;
    numPages: number;
    pageNum: number;
}

interface ViewPageActions {
    loadPageByCursor: (cursor: CursorType) => Promise<void>;
    loadPageByAction: (navAction: NavigationAction) => void;
    setPageData: (pageData: PageData) => void;
}

type ViewPageSlice = ViewPageValues & ViewPageActions;

interface ViewEventValues {
    logEventNum: number;
    dateTimeString: string;
}

interface ViewEventActions {
    setLogEventNum: (newLogEventNum: number) => void;
    setDateTimeString: (newDateTimeString: string) => void;
}

type ViewEventSlice = ViewEventValues & ViewEventActions;

interface ViewFormattingValues {
    isPrettified: boolean;
}

interface ViewFormattingActions {
    setIsPrettified: (newIsPrettified: boolean) => void;
}

type ViewFormattingSlice = ViewFormattingValues & ViewFormattingActions;

interface ViewFilterValues {
    logLevelFilter: LogLevelFilter;
    kqlFilter: string;
    kqlFilterInput: string;
}

interface ViewFilterActions {
    filterLogs: () => void;
    setKqlFilter: (newValue: string) => void;
    setKqlFilterInput: (newValue: string) => void;
    setLogLevelFilter: (newValue: LogLevelFilter) => void;
}

type ViewFilterSlice = ViewFilterValues & ViewFilterActions;

type ViewState = ViewPageSlice & ViewEventSlice & ViewFormattingSlice & ViewFilterSlice;

export type {
    ViewEventSlice,
    ViewEventValues,
    ViewFilterSlice,
    ViewFilterValues,
    ViewFormattingSlice,
    ViewFormattingValues,
    ViewPageSlice,
    ViewPageValues,
    ViewState,
};
