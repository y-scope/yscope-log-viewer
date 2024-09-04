/* eslint-disable max-lines */
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import * as monaco from "monaco-editor";

import {StateContext} from "../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    updateWindowUrlHashParams,
    UrlContext,
} from "../contexts/UrlContextProvider";
import {Nullable} from "../typings/common";
import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
    THEME_NAME,
} from "../typings/config";
import {
    LOG_LEVEL,
    LOG_LEVEL_NAMES_LIST,
    LogLevelFilter,
} from "../typings/logs";
import {CURSOR_CODE} from "../typings/worker";
import {ACTION_NAME} from "../utils/actions";
import {
    getConfig,
    setConfig,
} from "../utils/config";
import {openFile} from "../utils/file";
import DropFileContainer from "./DropFileContainer";
import Editor from "./Editor";
import {goToPositionAndCenter} from "./Editor/MonacoInstance/utils";


const formFields = [
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).formatString,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).logLevelKey,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).timestampKey,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_KEY.THEME),
        label: LOCAL_STORAGE_KEY.THEME,
        name: LOCAL_STORAGE_KEY.THEME,
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_KEY.PAGE_SIZE),
        label: LOCAL_STORAGE_KEY.PAGE_SIZE,
        name: LOCAL_STORAGE_KEY.PAGE_SIZE,
        type: "number",
    },
];

/**
 * Renders a form for testing config utilities.
 *
 * @return
 */
const ConfigForm = () => {
    const handleConfigFormReset = (ev: React.FormEvent) => {
        ev.preventDefault();
        window.localStorage.clear();
        window.location.reload();
    };

    const handleConfigFormSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);

        const formatString = formData.get(LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING);
        const logLevelKey = formData.get(LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY);
        const timestampKey = formData.get(LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY);
        const theme = formData.get(LOCAL_STORAGE_KEY.THEME);
        const pageSize = formData.get(LOCAL_STORAGE_KEY.PAGE_SIZE);
        let error = null;
        if (
            "string" === typeof formatString &&
            "string" === typeof logLevelKey &&
            "string" === typeof timestampKey
        ) {
            error ||= setConfig({
                key: CONFIG_KEY.DECODER_OPTIONS,
                value: {
                    formatString: formatString,
                    logLevelFilter: null,
                    logLevelKey: logLevelKey,
                    timestampKey: timestampKey,
                },
            });
        }
        if ("string" === typeof theme) {
            error ||= setConfig({
                key: CONFIG_KEY.THEME,
                value: theme as THEME_NAME,
            });
        }
        if ("string" === typeof pageSize) {
            error ||= setConfig({
                key: CONFIG_KEY.PAGE_SIZE,
                value: Number(pageSize),
            });
        }
        if (null !== error) {
            // eslint-disable-next-line no-alert
            window.alert(error);
        } else {
            window.location.reload();
        }
    };

    return (
        <form
            onReset={handleConfigFormReset}
            onSubmit={handleConfigFormSubmit}
        >
            <table>
                <tbody>
                    {formFields.map((field, index) => (
                        <tr key={index}>
                            <td>
                                {field.label}
                            </td>
                            <td>
                                <input
                                    defaultValue={field.initialValue}
                                    name={field.name}
                                    size={100}
                                    type={field.type}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button type={"submit"}>Apply</button>
                <button type={"reset"}>Clear localStorage</button>
            </div>
        </form>
    );
};

/**
 * Handles `logEventNum` input value change for debugging.
 *
 * @param ev
 */
const handleLogEventNumInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    updateWindowUrlHashParams({logEventNum: Number(ev.target.value)});
};

/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
// eslint-disable-next-line no-warning-comments
// TODO: replace elements in this component once we integrate with a UI framework
// eslint-disable-next-line max-lines-per-function
const Layout = () => {
    const {
        fileName,
        firstLogEventNumPerPage,
        lastLogEventNumPerPage,
        numEvents,
        numFilteredEvents,
        pageNum,

        changeLogLevelFilter,
        loadFile,
    } = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const [selectedLogLevels, setSelectedLogLevels] =
        useState<number[]>(LOG_LEVEL_NAMES_LIST as number[]);
    const firstLogEventNumPerPageRef = useRef<number[]>(firstLogEventNumPerPage);
    const lastLogEventNumPerPageRef = useRef<number[]>(lastLogEventNumPerPage);
    const logEventNumRef = useRef<Nullable<number>>(logEventNum);
    const numEventsRef = useRef<Nullable<number>>(numEvents);

    const handleCopyLinkButtonClick = () => {
        copyPermalinkToClipboard({}, {logEventNum: numEvents});
    };

    const handleOpenFileButtonClick = () => {
        openFile((file) => {
            loadFile(file, {code: CURSOR_CODE.LAST_EVENT, args: null});
        });
    };

    const handleLogLevelSelectChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        const selected: LOG_LEVEL[] = Array.from(ev.target.options)
            .map((option) => option.selected && Number(option.value))
            .filter((value) => "number" === typeof value);

        setSelectedLogLevels(selected);
        changeLogLevelFilter(selected);
    };

    /**
     * Handles custom actions in the editor.
     *
     * @param editor
     * @param actionName
     */
    const handleCustomAction = useCallback((
        editor: monaco.editor.IStandaloneCodeEditor,
        actionName: ACTION_NAME
    ) => {
        const [firstFilteredLogEventNum] = firstLogEventNumPerPageRef.current;
        const lastFilteredLogEventNum = firstLogEventNumPerPageRef.current.at(-1);

        switch (actionName) {
            case ACTION_NAME.FIRST_PAGE:
                updateWindowUrlHashParams({logEventNum: firstFilteredLogEventNum || 1});
                break;
            case ACTION_NAME.PREV_PAGE:
                if (null !== logEventNumRef.current) {
                    const lastLogEventNumOnPrevPage = lastLogEventNumPerPageRef.current.findLast(
                        (value: number) => (logEventNumRef.current as number > value)
                    ) || firstFilteredLogEventNum;

                    updateWindowUrlHashParams({
                        logEventNum: lastLogEventNumOnPrevPage || firstFilteredLogEventNum || 1,
                    });
                }
                break;
            case ACTION_NAME.NEXT_PAGE:
                if (null !== logEventNumRef.current) {
                    if ("undefined" === typeof lastFilteredLogEventNum) {
                        return;
                    }
                    const firstLogEventNumOnNextPage = firstLogEventNumPerPageRef.current.find(
                        (value: number) => (logEventNumRef.current as number < value)
                    );

                    updateWindowUrlHashParams({
                        logEventNum: firstLogEventNumOnNextPage ||
                        logEventNumRef.current < lastFilteredLogEventNum ?
                            lastFilteredLogEventNum :
                            numEventsRef.current,
                    });
                }
                break;
            case ACTION_NAME.LAST_PAGE:
                updateWindowUrlHashParams({
                    logEventNum: lastFilteredLogEventNum || numEventsRef.current,
                });
                break;
            case ACTION_NAME.PAGE_TOP:
                goToPositionAndCenter(editor, {lineNumber: 1, column: 1});
                break;
            case ACTION_NAME.PAGE_BOTTOM: {
                const lineCount = editor.getModel()?.getLineCount();
                if ("undefined" === typeof lineCount) {
                    break;
                }
                goToPositionAndCenter(editor, {lineNumber: lineCount, column: 1});
                break;
            }
            default:
                break;
        }
    }, []);

    // Synchronize `firstLogEventNumPerPageRef` with `firstLogEventNumPerPage`.
    useEffect(() => {
        firstLogEventNumPerPageRef.current = firstLogEventNumPerPage;
    }, [firstLogEventNumPerPage]);

    // Synchronize `lastLogEventNumPerPageRef` with `lastLogEventNumPerPage`.
    useEffect(() => {
        lastLogEventNumPerPageRef.current = lastLogEventNumPerPage;
    }, [lastLogEventNumPerPage]);

    // Synchronize `logEventNumRef` with `logEventNum`.
    useEffect(() => {
        logEventNumRef.current = logEventNum;
    }, [logEventNum]);

    // Synchronize `numEventsRef` with `numEvents`.
    useEffect(() => {
        numEventsRef.current = numEvents;
    }, [numEvents]);

    return (
        <>
            <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
                <h3>
                    LogEventNum -
                    {" "}
                    <input
                        type={"number"}
                        value={null === logEventNum ?
                            1 :
                            logEventNum}
                        onChange={handleLogEventNumInputChange}/>
                    {" / "}
                    {numEvents}
                    {` (NumFilteredEvents - ${numFilteredEvents}) | `}
                    PageNum -
                    {" "}
                    {pageNum}
                    {" "}
                    | FileName -
                    {" "}
                    {fileName}
                </h3>

                <button onClick={handleCopyLinkButtonClick}>
                    Copy link to last log
                </button>

                <button onClick={handleOpenFileButtonClick}>
                    Open File
                </button>

                <ConfigForm/>

                <select
                    multiple={true}
                    name={"log-level"}
                    style={{display: "table-row", height: "2rcap"}}
                    value={selectedLogLevels as unknown as string[]}
                    onChange={handleLogLevelSelectChange}
                >
                    {LOG_LEVEL_NAMES_LIST.map((logLevelName) => (
                        <option
                            key={logLevelName}
                            style={{display: "table-cell", width: "8rch", borderStyle: "solid"}}
                            value={LOG_LEVEL[logLevelName as LOG_LEVEL]}
                        >
                            {logLevelName}
                        </option>
                    ))}
                </select>
                <div style={{flexDirection: "column", flexGrow: 1}}>
                    <DropFileContainer>
                        <Editor onCustomAction={handleCustomAction}/>
                    </DropFileContainer>
                </div>
            </div>
        </>
    );
};

export default Layout;
