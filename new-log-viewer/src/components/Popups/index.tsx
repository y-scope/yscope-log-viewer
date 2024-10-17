import {useContext} from "react";

import {
    Snackbar,
    Stack,
} from "@mui/joy";

import {NotificationContext} from "../../contexts/NotificationContextProvider";
import PopupMessageBox from "./PopupMessageBox";

import "./index.css";


/**
 * Displays popups.
 *
 * @return
 */
const Popups = () => {
    const {popupMessages} = useContext(NotificationContext);

    return (
        <Snackbar
            className={"pop-up-messages-container-snackbar"}
            open={0 < popupMessages.length}
        >
            <Stack
                className={"pop-up-messages-container-stack"}
                direction={"column-reverse"}
                gap={1}
            >
                {popupMessages.map((message) => (
                    <PopupMessageBox
                        key={message.id}
                        message={message}/>
                ))}
            </Stack>
        </Snackbar>
    );
};

export default Popups;
