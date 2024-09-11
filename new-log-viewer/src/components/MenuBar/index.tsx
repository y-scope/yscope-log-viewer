import React, {
    useContext,
    useState,
} from "react";

import {
    Divider,
    IconButton,
    Sheet,
    Stack,
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

import {StateContext} from "../../contexts/StateContextProvider";
import {UrlContext} from "../../contexts/UrlContextProvider";
import {CURSOR_CODE} from "../../typings/worker";
import {
    ACTION_NAME,
    handleAction,
} from "../../utils/actions";
import {openFile} from "../../utils/file";
import ConfigModal from "../modals/SettingsModal";

import "./index.css";


/**
 * MenuBar component
 *
 * This component renders a menu bar with various navigation and action buttons.
 * It uses context to access the current log event number, file name, and other state information.
 *
 * @return The rendered MenuBar component.
 */
const MenuBar = () => {
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
        <>
            <Sheet className={"menu-bar"}>
                <Stack
                    alignItems={"center"}
                    className={"menu-bar-filename"}
                    direction={"row"}
                    flexGrow={1}
                    gap={0.5}
                >
                    <Description/>
                    <Typography level={"body-md"}>
                        {fileName}
                    </Typography>
                </Stack>

                <Divider orientation={"vertical"}/>
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

                <Divider orientation={"vertical"}/>
                <SmallIconButton
                    Icon={FileOpenIcon}
                    onClick={handleOpenFileButtonClick}/>
                <Divider orientation={"vertical"}/>
                <SmallIconButton
                    Icon={Settings}
                    onClick={() => {
                        setSettingsModelOpen(true);
                    }}/>
            </Sheet>
            <ConfigModal
                isOpen={settingsModelOpen}
                onClose={() => {
                    setSettingsModelOpen(false);
                }}/>
        </>
    );
};

export default MenuBar;
