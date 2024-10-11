import {
    useContext,
    useEffect,
} from "react";

import {
    Alert,
    Box,
    IconButton,
    Typography,
} from "@mui/joy";

import CloseIcon from "@mui/icons-material/Close";

import {
    DO_NOT_TIMEOUT_VALUE,
    NotificationContext,
    PopupMessage,
} from "../../contexts/NotificationContextProvider";
import {LOG_LEVEL} from "../../typings/logs";


interface PopupMessageProps {
    message: PopupMessage,
}

/**
 * Display a pop-up message in an alert box.
 *
 * @param props
 * @param props.message
 * @return
 */
const PopupMessageBox = ({message}: PopupMessageProps) => {
    const {handlePopupMessageClose} = useContext(NotificationContext);
    const color = message.level >= LOG_LEVEL.ERROR ?
        "danger" :
        "primary";

    useEffect(() => {
        if (DO_NOT_TIMEOUT_VALUE !== message.timeoutMillis) {
            setTimeout(
                () => {
                    handlePopupMessageClose(message);
                },
                message.timeoutMillis
            );
        }
    }, [
        message,
        handlePopupMessageClose,
    ]);

    return (
        <Alert
            className={"pop-up-message-box-alert"}
            color={color}
            variant={"outlined"}
        >
            <div className={"pop-up-message-box-alert-layout"}>
                <Box className={"pop-up-message-box-title-container"}>
                    <Typography
                        className={"pop-up-message-box-title-text"}
                        color={color}
                        level={"title-md"}
                    >
                        {message.title}
                    </Typography>
                    <IconButton
                        className={"pop-up-message-box-close-button"}
                        color={color}
                        size={"sm"}
                        onClick={() => { handlePopupMessageClose(message); }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </Box>
                <Typography level={"body-sm"}>
                    {message.message}
                </Typography>
            </div>
        </Alert>
    );
};

export default PopupMessageBox;
