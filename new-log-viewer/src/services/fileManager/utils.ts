import {
    BeginLineNumToLogEventNumMap,
    CURSOR_CODE,
    CursorType,
    FileSrcType,
    LOG_EVENT_ANCHOR,
} from "../../typings/worker";
import {getUint8ArrayFrom} from "../../utils/http";
import {getBasenameFromUrlOrDefault} from "../../utils/url";


/**
 * Gets the new log event number.
 *
 * @param cursor The cursor object containing the code and arguments.
 * @param beginLineNumToLogEventNum
 * @return The new log event number.
 * @throws {Error} There are no log events on the page.
 */
const getNewLogEventNum = (
    cursor: CursorType,
    beginLineNumToLogEventNum: BeginLineNumToLogEventNumMap
): number => {
    const {code, args} = cursor;
    const logEventNumOnPage: number[] = Array.from(beginLineNumToLogEventNum.values());

    // Default to last event on page.
    let newLogEventNum: number|undefined = logEventNumOnPage.at(-1);

    if (CURSOR_CODE.PAGE_NUM === code) {
        if (LOG_EVENT_ANCHOR.FIRST === args.logEventAnchor) {
            newLogEventNum = logEventNumOnPage.at(0);
        }
    }

    if (!newLogEventNum) {
        throw Error("There are no log events on the page.");
    }

    return newLogEventNum;
};

/**
 * Loads a file from a given source.
 *
 * @param fileSrc The source of the file to load. This can be a string representing a URL, or a File
 * object.
 * @return A promise that resolves with an object containing the file name and file data.
 * @throws {Error} If the file source type is not supported.
 */
const loadFile = async (fileSrc: FileSrcType)
    : Promise<{ fileName: string, fileData: Uint8Array }> => {
    let fileName: string;
    let fileData: Uint8Array;
    if ("string" === typeof fileSrc) {
        fileName = getBasenameFromUrlOrDefault(fileSrc);
        fileData = await getUint8ArrayFrom(fileSrc, () => null);
    } else {
        fileName = fileSrc.name;
        fileData = new Uint8Array(await fileSrc.arrayBuffer());
    }

    return {
        fileName,
        fileData,
    };
};

export {
    getNewLogEventNum,
    loadFile,
};
