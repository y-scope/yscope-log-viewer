import {
    useContext,
    useState,
} from "react";

import {
    Divider,
    Sheet,
    Stack,
    Typography,
} from "@mui/joy";

import Description from "@mui/icons-material/Description";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import Settings from "@mui/icons-material/Settings";

import {StateContext} from "../../contexts/StateContextProvider";
import {CURSOR_CODE} from "../../typings/worker";
import {openFile} from "../../utils/file";
import ConfigModal from "../modals/SettingsModal";
import NavigationBar from "./NavigationBar";
import SmallIconButton from "./SmallIconButton";

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
    const {fileName, loadFile} = useContext(StateContext);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

    const handleOpenFileButtonClick = () => {
        openFile((file) => {
            loadFile(file, {code: CURSOR_CODE.LAST_EVENT, args: null});
        });
    };

    const handleSettingsModalClose = () => {
        setIsSettingsModalOpen(false);
    };

    const handleSettingsModalOpen = () => {
        setIsSettingsModalOpen(true);
    };

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
                <NavigationBar/>
                <Divider orientation={"vertical"}/>
                <SmallIconButton onClick={handleOpenFileButtonClick}>
                    <FileOpenIcon/>
                </SmallIconButton>
                <Divider orientation={"vertical"}/>
                <SmallIconButton
                    onClick={handleSettingsModalOpen}
                >
                    <Settings/>
                </SmallIconButton>
            </Sheet>
            <ConfigModal
                isOpen={isSettingsModalOpen}
                onClose={handleSettingsModalClose}/>
        </>
    );
};

export default MenuBar;
