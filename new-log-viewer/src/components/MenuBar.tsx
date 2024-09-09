import React, {
    useContext,
    useState,
} from "react";

import {
    IconButton,
    Modal,
    Sheet,
    Typography,
} from "@mui/joy";

import {SvgIconComponent} from "@mui/icons-material";
import Description from "@mui/icons-material/Description";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import Settings from "@mui/icons-material/Settings";
import SkipNext from "@mui/icons-material/SkipNext";
import SkipPrevious from "@mui/icons-material/SkipPrevious";
import TipsAndUpdates from "@mui/icons-material/TipsAndUpdates";

import {StateContext} from "../contexts/StateContextProvider";
import {
    updateWindowUrlHashParams,
    UrlContext,
} from "../contexts/UrlContextProvider";
import {CONFIG_KEY} from "../typings/config";
import {CURSOR_CODE} from "../typings/worker";
import {ACTION_NAME} from "../utils/actions";
import {getConfig} from "../utils/config";
import {openFile} from "../utils/file";
import {
    getFirstItemNumInNextChunk,
    getLastItemNumInPrevChunk,
} from "../utils/math";
import ConfigDialog from "./modals/SettingsModal/ConfigDialog";


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
 *
 */
export const MenuBar = () => {
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
                <ConfigDialog/>
            </Modal>
        </Sheet>
    );
};
