import {
    useContext,
    useState,
} from "react";

import {
    Divider,
    LinearProgress,
    Sheet,
    Stack,
    Typography,
} from "@mui/joy";

import DescriptionIcon from "@mui/icons-material/Description";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import SettingsIcon from "@mui/icons-material/Settings";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    CURSOR_CODE,
    LOAD_STATE,
} from "../../typings/worker";
import {openFile} from "../../utils/file";
import SettingsModal from "../modals/SettingsModal";
import ExportLogsButton from "./ExportLogsButton";
import NavigationBar from "./NavigationBar";
import SmallIconButton from "./SmallIconButton";

import "./index.css";


/**
 * Renders a menu bar which displays file information and provides navigation and settings buttons.
 *
 * @return
 */
const MenuBar = () => {
    const {fileName, loadState, loadFile} = useContext(StateContext);

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
                    <DescriptionIcon/>
                    <Typography level={"body-md"}>
                        {fileName}
                    </Typography>
                </Stack>

                <Divider orientation={"vertical"}/>
                <NavigationBar/>
                <Divider orientation={"vertical"}/>
                <SmallIconButton
                    disabled={loadState === LOAD_STATE.LOADING}
                    onClick={handleOpenFileButtonClick}
                >
                    <FileOpenIcon/>
                </SmallIconButton>
                <Divider orientation={"vertical"}/>
                <SmallIconButton
                    disabled={loadState === LOAD_STATE.LOADING}
                    onClick={handleSettingsModalOpen}
                >
                    <SettingsIcon/>
                </SmallIconButton>
                <ExportLogsButton/>
            </Sheet>
            {loadState === LOAD_STATE.LOADING &&
                <LinearProgress
                    size={"sm"}
                    sx={{
                        "marginBottom": "-2px",
                        "--LinearProgress-thickness": "2px",
                        "--LinearProgress-progressThickness": "2px",
                        "zIndex": 10,
                    }}/>}
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleSettingsModalClose}/>
        </>
    );
};

export default MenuBar;
