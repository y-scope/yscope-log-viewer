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
    updatePageData: (pageData: PageData) => void;
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
