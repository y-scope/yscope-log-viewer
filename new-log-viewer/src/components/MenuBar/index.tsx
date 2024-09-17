import {useContext} from "react";

import {
    Divider,
    Sheet,
    Stack,
    Typography,
} from "@mui/joy";

import Description from "@mui/icons-material/Description";

import {StateContext} from "../../contexts/StateContextProvider";
import NavigationBar from "./NavigationBar";

import "./index.css";


/**
 * Renders a menu bar which displays file information and provides navigation and settings buttons.
 *
 * @return
 */
const MenuBar = () => {
    const {fileName} = useContext(StateContext);

    return (
        <>
            <Sheet className={"menu-bar"}>
                <Stack
                    className={"menu-bar-filename"}
                    direction={"row"}
                    gap={0.5}
                >
                    <Description/>
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
