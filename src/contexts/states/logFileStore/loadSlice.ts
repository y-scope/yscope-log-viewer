import {StateCreator} from "zustand/index";

import {Nullable} from "../../../typings/common";
import {CONFIG_KEY} from "../../../typings/config";
import {UI_STATE} from "../../../typings/states";
import {SEARCH_PARAM_NAMES} from "../../../typings/url";
import {
    CURSOR_CODE,
    CursorType,
    EVENT_POSITION_ON_PAGE,
    FileSrcType,
    WORKER_REQ_CODE,
} from "../../../typings/worker";
import {
    ACTION_NAME,
    NavigationAction,
} from "../../../utils/actions";
import {getConfig} from "../../../utils/config";
import {clamp} from "../../../utils/math";
import {updateWindowUrlSearchParams} from "../../UrlContextProvider";
import useLogExportStore from "../logExportStore";
import useMainWorkerStore from "../mainWorkerStore";
import useQueryStore from "../queryStore";
import useUiStore from "../uiStore";
import {
    LoadSlice,
    LogFileState,
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

/**
 * Creates a slice for loading files and loading pages by navigation actions.
 *
 * @param set
 * @param get
 * @return
 */
// eslint-disable-next-line max-lines-per-function
export const createLoadSlice: StateCreator<LogFileState, [], [], LoadSlice> = (set, get) => ({
    loadFile: (fileSrc: FileSrcType, cursor: CursorType) => {
        const {isPrettified, setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FILE_LOADING);

        useMainWorkerStore.getState().init();
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("loadFile: Main worker is not initialized.");

            return;
        }
        useQueryStore.getState().clearQuery();
        useLogExportStore.getState().setExportProgress(0);

        set({fileSrc});
        if ("string" !== typeof fileSrc) {
            updateWindowUrlSearchParams({[SEARCH_PARAM_NAMES.FILE_PATH]: null});
        }
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_FILE,
            args: {
                cursor: cursor,
                decoderOptions: getConfig(CONFIG_KEY.DECODER_OPTIONS),
                fileSrc: fileSrc,
                isPrettified: isPrettified,
                pageSize: getConfig(CONFIG_KEY.PAGE_SIZE),
            },
        });
    },
    loadPageByAction: (navAction: NavigationAction) => {
        const {mainWorker} = useMainWorkerStore.getState();
        if (null === mainWorker) {
            console.error("loadPageByAction: Main worker is not initialized.");

            return;
        }

        const {fileSrc, logEventNum, loadFile} = get();
        if (navAction.code === ACTION_NAME.RELOAD) {
            if (null === fileSrc || 0 === logEventNum) {
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

        const {numPages, pageNum} = get();
        const cursor = getPageNumCursor(navAction, pageNum, numPages);
        if (null === cursor) {
            console.error(`Error with nav action ${navAction.code}.`);

            return;
        }

        const {isPrettified, setUiState} = useUiStore.getState();
        setUiState(UI_STATE.FAST_LOADING);
        mainWorker.postMessage({
            code: WORKER_REQ_CODE.LOAD_PAGE,
            args: {
                cursor: cursor,
                isPrettified: isPrettified,
            },
        });
    },
});
