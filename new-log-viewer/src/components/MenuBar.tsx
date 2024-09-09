import React, {
    useContext,
    useState,
} from "react";

import {
    Button,
    DialogActions,
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

import {SvgIconComponent} from "@mui/icons-material";
import DarkMode from "@mui/icons-material/DarkMode";
import Description from "@mui/icons-material/Description";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import LightMode from "@mui/icons-material/LightMode";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import Settings from "@mui/icons-material/Settings";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import SkipNext from "@mui/icons-material/SkipNext";
import SkipPrevious from "@mui/icons-material/SkipPrevious";
import TipsAndUpdates from "@mui/icons-material/TipsAndUpdates";

import {StateContext} from "../contexts/StateContextProvider";
import {
    updateWindowUrlHashParams,
    UrlContext,
} from "../contexts/UrlContextProvider";
import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
    THEME_NAME,
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
import ConfigDialog from "./ConfigDialog";


/**
 *
 * @param actionName
 * @param logEventNum
 * @param numEvents
 */
export const handleAction = (actionName: ACTION_NAME, logEventNum: number, numEvents: number) => {
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
 * Handles the reset event for the configuration form.
 *
 * @param ev The form event triggered by the reset action.
 * @return
 */
const handleConfigFormReset = (ev: React.FormEvent) => {
    ev.preventDefault();
    window.localStorage.clear();
    window.location.reload();
};

/**
 * Handles the submit event for the configuration form.
 *
 * @param ev The form event triggered by the submit action.
 * @return
 */
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
        // eslint-disable-next-line no-warning-comments
        // TODO: Show an error pop-up once NotificationProvider is implemented.
        // eslint-disable-next-line no-alert
        window.alert(error);
    } else {
        window.location.reload();
    }
};

/**
 *
 */
export const MenuBar = () => {
    const {setMode, mode} = useColorScheme();
    const {logEventNum} = useContext(UrlContext);
    const {fileName, loadFile, numEvents} = useContext(StateContext);

    const [settingsModelOpen, setSettingsModelOpen] = useState<boolean>(false);

    const handleNavButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (null === logEventNum) {
            return;
        }
        const {actionName} = event.currentTarget.dataset as { actionName: ACTION_NAME };
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
        <Sheet className={"menu-bar"}>
            <Typography className={"menu-bar-typography"}>
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
                onClose={() => {
                    setSettingsModelOpen(false);
                }}
            >
                <form
                    onReset={handleConfigFormReset}
                    onSubmit={handleConfigFormSubmit}
                >
                    <ModalDialog layout={"fullscreen"}>
                        <DialogTitle className={"menu-bar-modal"}>
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
                            <ConfigDialog/>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                color={"primary"}
                                type={"submit"}
                            >
                                Apply & Reload
                            </Button>
                            <Button
                                color={"neutral"}
                                type={"reset"}
                            >
                                Reset Default
                            </Button>
                        </DialogActions>
                    </ModalDialog>
                </form>
            </Modal>
        </Sheet>
    );
};
