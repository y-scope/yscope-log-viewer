import {
    Box,
    Divider,
    LinearProgress,
    Sheet,
    Typography,
} from "@mui/joy";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import useLogFileStore from "../../stores/logFileStore";
import useUiStore from "../../stores/uiStore";
import {UI_ELEMENT} from "../../typings/states";
import {CURSOR_CODE} from "../../typings/worker";
import {openFile} from "../../utils/file";
import {isDisabled} from "../../utils/states";
import ExportLogsButton from "./ExportLogsButton";
import MenuBarIconButton from "./MenuBarIconButton";
import NavigationBar from "./NavigationBar";

import "./index.css";


/**
 * Renders a menu bar which displays file information and provides navigation and settings buttons.
 *
 * @return
 */
const MenuBar = () => {
    const fileName = useLogFileStore((state) => state.fileName);
    const loadFile = useLogFileStore((state) => state.loadFile);
    const uiState = useUiStore((state) => state.uiState);

    const handleOpenFile = () => {
        openFile((file) => {
            loadFile(file, {code: CURSOR_CODE.LAST_EVENT, args: null});
        });
    };

    return (
        <>
            <Sheet className={"menu-bar"}>
                <div className={"menu-bar-logo-container"}>
                    <img
                        alt={"yscope-small-logo"}
                        src={"./favicon.svg"}
                        width={20}/>
                </div>

                <Divider orientation={"vertical"}/>
                <MenuBarIconButton
                    disabled={isDisabled(uiState, UI_ELEMENT.OPEN_FILE_BUTTON)}
                    title={"Open file"}
                    tooltipPlacement={"bottom-start"}
                    onClick={handleOpenFile}
                >
                    <FolderOpenIcon className={"menu-bar-open-file-icon"}/>
                </MenuBarIconButton>
                <Divider orientation={"vertical"}/>

                <Box
                    className={"menu-bar-filename-container"}
                    title={fileName}
                >
                    <Typography
                        className={"menu-bar-filename-left-split"}
                        level={"body-md"}
                    >
                        {fileName.slice(0, fileName.length / 2)}
                    </Typography>
                    <Typography
                        className={"menu-bar-filename-right-split"}
                        level={"body-md"}
                    >
                        {fileName.slice(fileName.length / 2)}
                    </Typography>
                </Box>

                <Divider orientation={"vertical"}/>
                <NavigationBar/>
                <Divider orientation={"vertical"}/>

                <ExportLogsButton/>
            </Sheet>
            {(false === isDisabled(uiState, UI_ELEMENT.PROGRESS_BAR)) &&
                <LinearProgress
                    className={"menu-bar-loading-progress"}
                    size={"sm"}
                    thickness={2}/>}
        </>
    );
};

export default MenuBar;
