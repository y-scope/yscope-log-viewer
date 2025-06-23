import {StateCreator} from "zustand";

import {Nullable} from "../../typings/common";
import {UI_STATE} from "../../typings/states";
import {
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
    PageData,
} from "../../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../../utils/actions";
import {clamp} from "../../utils/math";
import {updateWindowUrlHashParams} from "../../utils/url";
import useLogFileManagerStore from "../logFileManagerProxyStore";
import useLogFileStore from "../logFileStore";
import {handleErrorWithNotification} from "../notificationStore";
import useUiStore from "../uiStore";
import {VIEW_EVENT_DEFAULT} from "./createViewEventSlice";
import {
    ViewPageSlice,
    ViewPageValues,
    ViewState,
} from "./types";


/**
 * Returns a `PAGE_NUM` cursor based on a navigation action.
 *
 * @param navAction Action to navigate to a new page.
 * @param currentPageNum
 * @param numPages
 * @return `PAGE_NUM` cursor.
 */
const getPageNumCursor = (
    navAction: NavigationAction,
    currentPageNum: number,
    numPages: number
): Nullable<CursorType> => {
    let newPageNum: number;
    let position: EVENT_POSITION_ON_PAGE;
    switch (navAction.code) {
        case ACTION_NAME.SPECIFIC_PAGE:
            position = EVENT_POSITION_ON_PAGE.TOP;

            // Clamp is to prevent someone from requesting non-existent page.
            newPageNum = clamp(navAction.args.pageNum, 1, numPages);
            break;
        case ACTION_NAME.FIRST_PAGE:
            position = EVENT_POSITION_ON_PAGE.TOP;
            newPageNum = 1;
            break;
        case ACTION_NAME.PREV_PAGE:
            position = EVENT_POSITION_ON_PAGE.BOTTOM;
            newPageNum = clamp(currentPageNum - 1, 1, numPages);
            break;
        case ACTION_NAME.NEXT_PAGE:
            position = EVENT_POSITION_ON_PAGE.TOP;
            newPageNum = clamp(currentPageNum + 1, 1, numPages);
            break;
        case ACTION_NAME.LAST_PAGE:
            position = EVENT_POSITION_ON_PAGE.BOTTOM;
            newPageNum = numPages;
            break;
        default:
            return null;
    }

    return {
        code: CURSOR_CODE.PAGE_NUM,
        args: {pageNum: newPageNum, eventPositionOnPage: position},
    };
};

const VIEW_PAGE_VALUES_DEFAULT: ViewPageValues = {
    beginLineNumToLogEventNum: new Map<number, number>(),
    logData: "No file is open.",
    numPages: 0,
    pageNum: 0,
};

/**
 * Creates a slice for updating the view state.
 *
 * @param set
 * @param get
 * @return
 */
const createViewPageSlice: StateCreator<
    ViewState, [], [], ViewPageSlice
> = (set, get) => ({
    ...VIEW_PAGE_VALUES_DEFAULT,
    updatePageData: (pageData: PageData) => {
        set({
            logData: pageData.logs,
            numPages: pageData.numPages,
            pageNum: pageData.pageNum,
            beginLineNumToLogEventNum: pageData.beginLineNumToLogEventNum,
        });
        const newLogEventNum = pageData.logEventNum;
        updateWindowUrlHashParams({logEventNum: newLogEventNum});
        const {updateLogEventNum} = get();
        updateLogEventNum(newLogEventNum);
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.READY);
    },
    loadPageByAction: (navAction: NavigationAction) => {
        if (navAction.code === ACTION_NAME.RELOAD) {
            const {fileSrc, loadFile} = useLogFileStore.getState();
            const {logEventNum} = get();
            if (null === fileSrc || VIEW_EVENT_DEFAULT.logEventNum === logEventNum) {
                throw new Error(
                    `Unexpected fileSrc=${JSON.stringify(
                        fileSrc
                    )}, logEventNum=${logEventNum} when reloading.`
                );
            }
            loadFile(fileSrc, {
                code: CURSOR_CODE.EVENT_NUM,
                args: {eventNum: logEventNum},
            });

            return;
        }

        const {uiState, setUiState} = useUiStore.getState();
        if (UI_STATE.READY !== uiState) {
            console.warn("Skipping navigation: page load in progress.");

            return;
        }
        setUiState(UI_STATE.FAST_LOADING);

        const {numPages, pageNum} = get();
        const cursor = getPageNumCursor(navAction, pageNum, numPages);
        if (null === cursor) {
            console.error(`Error with nav action ${navAction.code}.`);

            return;
        }

        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const {isPrettified} = get();
            const pageData = await logFileManagerProxy.loadPage(cursor, isPrettified);

            const {updatePageData} = get();
            updatePageData(pageData);
        })().catch(handleErrorWithNotification);
    },
});


export {VIEW_PAGE_VALUES_DEFAULT};
export default createViewPageSlice;
