import {useContext} from "react";

import {
    Snackbar,
    Stack,
} from "@mui/joy";

import {NotificationContext} from "../../contexts/NotificationContextProvider";
import PopUpMessageBox from "./PopUpMessageBox";

import "./index.css";


/**
 * Displays pop-ups in a transparent container positioned on the right side of the viewport.
 *
 * @return
 */
const PopUps = () => {
    const {popUpMessages} = useContext(NotificationContext);

    return (
        <Snackbar
            className={"pop-up-messages-container-snackbar"}
            open={0 < popUpMessages.length}
        >
            <Stack
                className={"pop-up-messages-container-stack"}
                direction={"column-reverse"}
                gap={1}
            >
                {popUpMessages.map((message) => (
                    <PopUpMessageBox
                        key={message.id}
                        message={message}/>
                ))}
            </Stack>
        </Snackbar>
    );
};

export default PopUps;
