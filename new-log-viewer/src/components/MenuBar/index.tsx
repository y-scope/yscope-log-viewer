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

import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import SettingsIcon from "@mui/icons-material/Settings";

import {StateContext} from "../../contexts/StateContextProvider";
import {CURSOR_CODE} from "../../typings/worker";
import {openFile} from "../../utils/file";
import SettingsModal from "../modals/SettingsModal";
import NavigationBar from "./NavigationBar";
import SmallIconButton from "./SmallIconButton";

import "./index.css";


/**
 * Renders a menu bar which displays file information and provides navigation and settings buttons.
 *
 * @return
 */
const MenuBar = () => {
    const {fileName, exportLogs, loadFile} = useContext(StateContext);

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

    const handleExportLogsButtonClick = () => {
        exportLogs();
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
                <SmallIconButton onClick={handleOpenFileButtonClick}>
                    <FileOpenIcon/>
                </SmallIconButton>
                <Divider orientation={"vertical"}/>
                <SmallIconButton
                    onClick={handleSettingsModalOpen}
                >
                    <SettingsIcon/>
                </SmallIconButton>
                <SmallIconButton onClick={handleExportLogsButtonClick}>
                    <DownloadIcon/>
                </SmallIconButton>
            </Sheet>
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleSettingsModalClose}/>
        </>
    );
};

export default MenuBar;
