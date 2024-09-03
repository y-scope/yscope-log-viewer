import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import * as monaco from "monaco-editor";

import {
    Button,
    IconButton,
    Input,
    Modal,
    Sheet,
    ToggleButtonGroup,
    Typography,
    useColorScheme,
} from "@mui/joy";

import {
    DarkMode,
    Description,
    HdrAuto,
    LightMode,
    NavigateBefore,
    NavigateNext,
    Settings,
    SkipNext,
    SkipPrevious,
    TipsAndUpdates,
} from "@mui/icons-material";

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
} from "../typings/config";
import {CURSOR_CODE} from "../typings/worker";
import {ACTION_NAME} from "../utils/actions";
import {
    getConfig,
    setConfig,
} from "../utils/config";
import {openFile} from "../utils/file";
import {
    getFirstItemNumInNextChunk,
    getLastItemNumInPrevChunk,
} from "../utils/math";
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
                                <Input
                                    slotProps={{
                                        input: {
                                            defaultValue: field.initialValue,
                                            name: field.name,
                                            size: 100,
                                            type: field.type,
                                        },
                                    }}/>
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
    const {setMode, mode} = useColorScheme();
    const {
        fileName,
        loadFile,
        numEvents,
        pageNum,
    } = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

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

    const handleAction = (actionName: ACTION_NAME) => {
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
            default: break;
        }
    };

    /**
     * Handles custom actions in the editor.
     *
     * @param editor
     * @param actionName
     */
    const handleEditorCustomAction = useCallback((
        editor: monaco.editor.IStandaloneCodeEditor,
        actionName: ACTION_NAME
    ) => {
        const pageSize = getConfig(CONFIG_KEY.PAGE_SIZE);

        switch (actionName) {
            case ACTION_NAME.FIRST_PAGE:
            case ACTION_NAME.PREV_PAGE:
            case ACTION_NAME.NEXT_PAGE:
            case ACTION_NAME.LAST_PAGE:
                handleAction(actionName);
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
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const actionName = event.currentTarget.getAttribute("data-action-name") as ACTION_NAME;
        if (Object.values(ACTION_NAME).includes(actionName)) {
            handleAction(actionName);
        }
    };
    const [open, setOpen] = React.useState<boolean>(false);


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
                <Sheet style={{display: "flex", flexDirection: "row"}}>
                    <IconButton>
                        <Description/>
                    </IconButton>
                    <IconButton
                        data-action-name={ACTION_NAME.FIRST_PAGE}
                        onClick={handleButtonClick}
                    >
                        <SkipPrevious/>
                    </IconButton>
                    <IconButton
                        data-action-name={ACTION_NAME.PREV_PAGE}
                        onClick={handleButtonClick}
                    >
                        <NavigateBefore/>
                    </IconButton>
                    <IconButton
                        data-action-name={ACTION_NAME.NEXT_PAGE}
                        onClick={handleButtonClick}
                    >
                        <NavigateNext/>
                    </IconButton>
                    <IconButton
                        data-action-name={ACTION_NAME.LAST_PAGE}
                        onClick={handleButtonClick}
                    >
                        <SkipNext/>
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            setOpen(true);
                        }}
                    >
                        <Settings/>
                    </IconButton>
                    <IconButton>
                        <TipsAndUpdates/>
                    </IconButton>
                    <ToggleButtonGroup
                        exclusive={true}
                    >
                        <IconButton
                            onClick={() => { setMode("light"); }}
                        >
                            <LightMode/>
                        </IconButton>
                        <IconButton
                            onClick={() => { setMode("dark"); }}
                        >
                            <DarkMode/>
                        </IconButton>
                        <IconButton
                            onClick={() => { setMode("system"); }}
                        >
                            <HdrAuto/>
                        </IconButton>
                    </ToggleButtonGroup>

                    <Modal
                        aria-describedby={"modal-desc"}
                        aria-labelledby={"modal-title"}
                        open={open}
                        sx={{display: "flex", justifyContent: "center", alignItems: "center"}}
                        onClose={() => {
                            setOpen(false);
                        }}
                    >
                        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
                            <h3>
                                LogEventNum -
                                {" "}
                                <Input
                                    slotProps={{
                                        input: {
                                            type: "number",
                                            value: null === logEventNum ?
                                                1 :
                                                logEventNum,
                                            onChange: handleLogEventNumInputChange,
                                        },
                                    }}/>
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
                        </div>
                    </Modal>

                </Sheet>
                <div style={{flexDirection: "column", flexGrow: 1}}>
                                        <DropFileContainer>

                    <Editor onCustomAction={handleEditorCustomAction}/>
                    </DropFileContainer>

                    </div>
                {/* <Sheet sx={{display: "flex", flexDirection: "row", paddingLeft: "12px"}}> */}
                <Sheet sx={{height: "30px", display: "flex", alignItems: "center"}}>
                    <Typography
                        level={"body-md"}
                        sx={{flexGrow: 1}}
                    >
                        Status message
                    </Typography>
                    <Button onClick={() => { copyPermalinkToClipboard({}, {}); }}>
                        Log Event
                        {" "}
                        {logEventNum}
                        {" "}
                        of
                        {" "}
                        {numEvents}
                    </Button>

                </Sheet>
            </div>
        </>
    );
};

export default Layout;
