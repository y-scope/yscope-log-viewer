import {LogLevelFilter} from "../../typings/logs";
import {
    BeginLineNumToLogEventNumMap,
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
    loadPageByAction: (navAction: NavigationAction) => void;
    updatePageData: (pageData: PageData) => void;
}

type ViewPageSlice = ViewPageValues & ViewPageActions;

interface ViewEventValues {
    logEventNum: number;
}

interface ViewEventActions {
    updateLogEventNum: (newLogEventNum: number) => void;
}

type ViewEventSlice = ViewEventValues & ViewEventActions;

interface ViewFormattingValues {
    isPrettified: boolean;
    timezoneName: string;
}

interface ViewFormattingActions {
    updateIsPrettified: (newIsPrettified: boolean) => void;
    updateTimezoneName: (newTimezoneName: string) => void;
}

type ViewFormattingSlice = ViewFormattingValues & ViewFormattingActions;

interface ViewFilterSlice {
    filterLogs: (filter: LogLevelFilter) => void;
}

type ViewState = ViewPageSlice & ViewEventSlice & ViewFormattingSlice & ViewFilterSlice;

export type {
    ViewEventSlice,
    ViewEventValues,
    ViewFilterSlice,
    ViewFormattingSlice,
    ViewFormattingValues,
    ViewPageSlice,
    ViewPageValues,
    ViewState,
};
