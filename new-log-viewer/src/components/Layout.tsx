import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";

import * as monaco from "monaco-editor";

import {Button} from "@mui/joy";

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
import {ACTION_NAME} from "../utils/actions";
import {
    getConfig,
    setConfig,
} from "../utils/config";
import {
    getFirstItemNumInNextChunk,
    getLastItemNumInPrevChunk,
} from "../utils/math";
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
                value: {formatString, logLevelKey, timestampKey},
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
                <Button
                    color={"success"}
                    type={"submit"}
                >
                    Apply
                </Button>
                <Button
                    color={"neutral"}
                    type={"reset"}
                >
                    Clear localStorage
                </Button>
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
const Layout = () => {
    const {
        pageNum,
        numEvents,
    } = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const logEventNumRef = useRef<Nullable<number>>(logEventNum);
    const numEventsRef = useRef<Nullable<number>>(numEvents);

    const handleCopyLinkButtonClick = () => {
        copyPermalinkToClipboard({}, {logEventNum: numEvents});
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
        const pageSize = getConfig(CONFIG_KEY.PAGE_SIZE);

        switch (actionName) {
            case ACTION_NAME.FIRST_PAGE:
                updateWindowUrlHashParams({logEventNum: 1});
                break;
            case ACTION_NAME.PREV_PAGE:
                if (null !== logEventNumRef.current) {
                    updateWindowUrlHashParams({
                        logEventNum: getLastItemNumInPrevChunk(logEventNumRef.current, pageSize),
                    });
                }
                break;
            case ACTION_NAME.NEXT_PAGE:
                if (null !== logEventNumRef.current) {
                    updateWindowUrlHashParams({
                        logEventNum: getFirstItemNumInNextChunk(logEventNumRef.current, pageSize),
                    });
                }
                break;
            case ACTION_NAME.LAST_PAGE:
                updateWindowUrlHashParams({logEventNum: numEventsRef.current});
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
            default: break;
        }
    }, []);

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
                    {" "}
                    |
                    PageNum -
                    {" "}
                    {pageNum}
                </h3>

                <Button
                    color={"success"}
                    onClick={handleCopyLinkButtonClick}
                >
                    Copy link to last log
                </Button>

                <ConfigForm/>
                <div style={{flexDirection: "column", flexGrow: 1}}>
                    <Editor onCustomAction={handleCustomAction}/>
                </div>
            </div>
        </>
    );
};

export default Layout;
