import {useContext} from "react";

import {
    Divider,
    IconButton,
    Sheet,
    Stack,
    Typography,
} from "@mui/joy";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import {StateContext} from "../../contexts/StateContextProvider";
import {CURSOR_CODE} from "../../typings/worker";
import {openFile} from "../../utils/file";
import NavigationBar from "./NavigationBar";

import "./index.css";


/**
 * Renders a menu bar which displays file information and provides navigation and settings buttons.
 *
 * @return
 */
const MenuBar = () => {
    const {fileName, loadFile} = useContext(StateContext);

    const handleOpenFile = () => {
        openFile((file) => {
            loadFile(file, {code: CURSOR_CODE.LAST_EVENT, args: null});
        });
    };

    return (
        <>
            <Sheet className={"menu-bar"}>
                <Stack
                    className={"menu-bar-filename"}
                    direction={"row"}
                    gap={0.5}
                >
                    <IconButton
                        size={"sm"}
                        onClick={handleOpenFile}
                    >
                        <FolderOpenIcon/>
                    </IconButton>
                    <Typography level={"body-md"}>
                        {fileName}
                    </Typography>
                </Stack>

                <Divider orientation={"vertical"}/>
                <NavigationBar/>
            </Sheet>
        </>
    );
};

export default MenuBar;
