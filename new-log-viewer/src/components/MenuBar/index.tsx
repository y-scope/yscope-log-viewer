import {useContext} from "react";

import {
    Button,
    Divider,
    Sheet,
    Stack,
    Typography,
} from "@mui/joy";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import {StateContext} from "../../contexts/StateContextProvider";
import {CURSOR_CODE} from "../../typings/worker";
import {openFile} from "../../utils/file";
import YScopeLogo from "../YScopeLogo";
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
                <YScopeLogo className={"menu-bar-logo"}/>
                <Stack
                    className={"menu-bar-filename"}
                    direction={"row"}
                    gap={1}
                >
                    <Button
                        size={"sm"}
                        startDecorator={<FolderOpenIcon/>}
                        onClick={handleOpenFile}
                    >
                        Open
                    </Button>
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
