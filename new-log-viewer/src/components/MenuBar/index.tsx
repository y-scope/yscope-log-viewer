import {useContext} from "react";

import {
    Divider,
    IconButton,
    LinearProgress,
    Sheet,
    Tooltip,
    Typography,
} from "@mui/joy";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    CURSOR_CODE,
    LOAD_STATE,
} from "../../typings/worker";
import {openFile} from "../../utils/file";
import ExportLogsButton from "./ExportLogsButton";
import NavigationBar from "./NavigationBar";

import "./index.css";


/**
 * Renders a menu bar which displays file information and provides navigation and settings buttons.
 *
 * @return
 */
const MenuBar = () => {
    const {fileName, loadState, loadFile} = useContext(StateContext);

    const handleOpenFile = () => {
        openFile((file) => {
            loadFile(file, {code: CURSOR_CODE.LAST_EVENT, args: null});
        });
    };

    const isLoading = LOAD_STATE.LOADING_FILE === loadState;

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
                <Tooltip
                    arrow={true}
                    placement={"right"}
                    title={"Open file"}
                    variant={"outlined"}
                >
                    <IconButton
                        size={"sm"}
                        onClick={handleOpenFile}
                        disabled={loadState === LOAD_STATE.LOADING_FILE || loadState === LOAD_STATE.EXPORTING}
                    >
                        <FolderOpenIcon className={"menu-bar-open-file-icon"}/>
                    </IconButton>
                </Tooltip>
                <Divider orientation={"vertical"}/>

                <Typography
                    className={"menu-bar-filename"}
                    level={"body-md"}
                >
                    {fileName}
                </Typography>

                <Divider orientation={"vertical"}/>
                <NavigationBar/>
                <Divider orientation={"vertical"}/>

                <ExportLogsButton/>
            </Sheet>
            {isLoading &&
                <LinearProgress
                    className={"menu-bar-loading-progress"}
                    size={"sm"}/>}
        </>
    );
};

export default MenuBar;
