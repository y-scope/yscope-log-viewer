import {StateCreator} from "zustand";

import {Nullable} from "../../typings/common";
import {LogLevelFilter} from "../../typings/logs";
import {UI_STATE} from "../../typings/states";
import {
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
} from "../../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../../utils/actions";
import {clamp} from "../../utils/math";
import useLogFileManagerStore from "../logFileManagerProxyStore";
import useLogFileStore from "../logFileStore";
import {handleErrorWithNotification} from "../notificationStore";
import useQueryStore from "../queryStore";
import useUiStore from "../uiStore";
import {VIEW_VALUES_DEFAULT} from "./createViewUpdateSlice.ts";
import {
    ViewState,
    ViewUtilitySlice,
} from "./types.ts";


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


/**
 * Creates a slice for view utility functions.
 *
 * @param _
 * @param get
 * @return
 */
const createViewUtilitySlice: StateCreator<
    ViewState, [], [], ViewUtilitySlice
// eslint-disable-next-line max-lines-per-function
> = (_, get) => ({
    filterLogs: (filter: LogLevelFilter) => {
        const {setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        (async () => {
            const {logFileManagerProxy} = useLogFileManagerStore.getState();
            const {isPrettified, logEventNum} = get();
            const pageData = await logFileManagerProxy.setFilter(
                {
                    code: CURSOR_CODE.EVENT_NUM,
                    args: {
                        eventNum: logEventNum,
                    },
                },
                isPrettified,
                filter
            );

            const {updatePageData} = get();
            updatePageData(pageData);

            const {startQuery} = useQueryStore.getState();
            startQuery();
        })().catch(handleErrorWithNotification);
    },
    loadPageByAction: (navAction: NavigationAction) => {
        if (navAction.code === ACTION_NAME.RELOAD) {
            const {fileSrc, loadFile} = useLogFileStore.getState();
            const {logEventNum} = get();
            if (null === fileSrc || VIEW_VALUES_DEFAULT.logEventNum === logEventNum) {
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

export {createViewUtilitySlice};
