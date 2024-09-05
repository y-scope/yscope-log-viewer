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
    DialogContent,
    DialogTitle,
    IconButton,
    Modal,
    ModalDialog,
    Sheet,
    ToggleButtonGroup,
    Typography,
    useColorScheme,
} from "@mui/joy";
import type {Mode} from "@mui/system/cssVars/useCurrentColorScheme";

import {
    DarkMode,
    Description,
    LightMode,
    NavigateBefore,
    NavigateNext,
    Settings,
    SkipNext,
    SkipPrevious,
    SvgIconComponent,
    TipsAndUpdates,
} from "@mui/icons-material";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

import {StateContext} from "../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    updateWindowUrlHashParams,
    UrlContext,
} from "../contexts/UrlContextProvider";
import {Nullable} from "../typings/common";
import {
    CONFIG_KEY,
    THEME_NAME,
} from "../typings/config";
import {CURSOR_CODE} from "../typings/worker";
import {ACTION_NAME} from "../utils/actions";
import {getConfig} from "../utils/config";
import {openFile} from "../utils/file";
import {
    getFirstItemNumInNextChunk,
    getLastItemNumInPrevChunk,
} from "../utils/math";
import ConfigForm from "./ConfigForm";
import DropFileContainer from "./DropFileContainer";
import Editor from "./Editor";
import {goToPositionAndCenter} from "./Editor/MonacoInstance/utils";


/**
 *
 * @param actionName
 * @param logEventNum
 * @param numEvents
 */
const handleAction = (actionName: ACTION_NAME, logEventNum: number, numEvents: number) => {
    const pageSize = getConfig(CONFIG_KEY.PAGE_SIZE);
    switch (actionName) {
        case ACTION_NAME.FIRST_PAGE:
            updateWindowUrlHashParams({logEventNum: 1});
            break;
        case ACTION_NAME.PREV_PAGE:
            updateWindowUrlHashParams({
                logEventNum: getLastItemNumInPrevChunk(logEventNum, pageSize),
            });
            break;
        case ACTION_NAME.NEXT_PAGE:
            updateWindowUrlHashParams({
                logEventNum: getFirstItemNumInNextChunk(logEventNum, pageSize),
            });
            break;
        case ACTION_NAME.LAST_PAGE:
            updateWindowUrlHashParams({logEventNum: numEvents});
            break;
        default:
            break;
    }
};

/**
 *
 */
const MenuBar = () => {
    const {setMode, mode} = useColorScheme();
    const {logEventNum} = useContext(UrlContext);
    const {fileName, loadFile, numEvents} = useContext(StateContext);


    const [settingsModelOpen, setSettingsModelOpen] = useState<boolean>(false);

    const handleNavButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (null === logEventNum) {
            return;
        }
        const {actionName} = event.currentTarget.dataset as {actionName: ACTION_NAME};
        if (Object.values(ACTION_NAME).includes(actionName)) {
            handleAction(actionName, logEventNum, numEvents);
        }
    };

    const handleOpenFileButtonClick = () => {
        openFile((file) => {
            loadFile(file, {code: CURSOR_CODE.LAST_EVENT, args: null});
        });
    };

    const SmallNavIconButton = ({actionName, Icon}: {
        actionName: string,
        Icon: SvgIconComponent,
    }) => (
        <IconButton
            data-action-name={actionName}
            size={"sm"}
            onClick={handleNavButtonClick}
        >
            <Icon/>
        </IconButton>
    );
    const SmallIconButton = ({onClick, Icon}: {
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
        Icon: SvgIconComponent,
    }) => (
        <IconButton
            size={"sm"}
            onClick={onClick}
        >
            <Icon/>
        </IconButton>
    );

    return (
        <Sheet
            style={{
                display: "flex",
                flexDirection: "row",
                height: "32px",
                alignItems: "center",
            }}
        >
            <Typography
                alignItems={"center"}
                display={"flex"}
                flexGrow={1}
                gap={"2px"}
                level={"title-sm"}
            >
                <Description/>
                {fileName}
            </Typography>

            <SmallNavIconButton
                actionName={ACTION_NAME.FIRST_PAGE}
                Icon={SkipPrevious}/>
            <SmallNavIconButton
                actionName={ACTION_NAME.PREV_PAGE}
                Icon={NavigateBefore}/>
            <SmallNavIconButton
                actionName={ACTION_NAME.NEXT_PAGE}
                Icon={NavigateNext}/>
            <SmallNavIconButton
                actionName={ACTION_NAME.LAST_PAGE}
                Icon={SkipNext}/>
            <SmallIconButton
                Icon={FileOpenIcon}
                onClick={handleOpenFileButtonClick}/>
            <SmallIconButton
                Icon={Settings}
                onClick={() => {
                    setSettingsModelOpen(true);
                }}/>
            <IconButton
                size={"sm"}
            >
                <TipsAndUpdates/>
            </IconButton>
            <Modal
                open={settingsModelOpen}
                sx={{display: "flex", justifyContent: "center", alignItems: "center"}}
                onClose={() => {
                    setSettingsModelOpen(false);
                }}
            >
                <ModalDialog>
                    <DialogTitle>
                        <span style={{flexGrow: 1}}>
                            Settings
                        </span>
                        <ToggleButtonGroup
                            size={"sm"}
                            value={mode as string}
                            onChange={(_, newValue) => {
                                setMode(newValue as Mode);
                            }}
                        >
                            <Button
                                startDecorator={<LightMode/>}
                                value={THEME_NAME.LIGHT}
                            >
                                Light
                            </Button>
                            <Button
                                startDecorator={<SettingsBrightnessIcon/>}
                                value={THEME_NAME.SYSTEM}
                            >
                                System
                            </Button>
                            <Button
                                startDecorator={<DarkMode/>}
                                value={THEME_NAME.DARK}
                            >
                                Dark
                            </Button>
                        </ToggleButtonGroup>
                    </DialogTitle>
                    <DialogContent>
                        <ConfigForm/>
                    </DialogContent>
                </ModalDialog>
            </Modal>
        </Sheet>
    );
};

/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    const {
        numEvents,
    } = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const logEventNumRef = useRef<Nullable<number>>(logEventNum);
    const numEventsRef = useRef<Nullable<number>>(numEvents);

    const handleCopyLinkButtonClick = () => {
        copyPermalinkToClipboard({}, {});
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
        if (null === logEventNumRef.current || null === numEventsRef.current) {
            return;
        }
        switch (actionName) {
            case ACTION_NAME.FIRST_PAGE:
            case ACTION_NAME.PREV_PAGE:
            case ACTION_NAME.NEXT_PAGE:
            case ACTION_NAME.LAST_PAGE:
                handleAction(actionName, logEventNumRef.current, numEventsRef.current);
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
            <div style={{height: "100vh"}}>
                <MenuBar/>
                <div style={{height: "calc(100vh - 32px - 32px)"}}>
                    <DropFileContainer>
                        <Editor onCustomAction={handleEditorCustomAction}/>
                    </DropFileContainer>
                </div>
                <Sheet
                    sx={{
                        alignItems: "center",
                        bottom: 0,
                        display: "flex",
                        height: "30px",
                        position: "absolute",
                        width: "100%",
                    }}
                >
                    <Typography
                        level={"body-sm"}
                        sx={{flexGrow: 1}}
                    >
                        Status message
                    </Typography>
                    <Button
                        size={"sm"}
                        sx={{minHeight: 0}}
                        onClick={handleCopyLinkButtonClick}
                    >
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
