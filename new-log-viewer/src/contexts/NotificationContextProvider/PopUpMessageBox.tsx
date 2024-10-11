import {
    useCallback,
    useEffect,
} from "react";

import {
    Alert,
    Box,
    IconButton,
    Typography,
} from "@mui/joy";

import CloseIcon from "@mui/icons-material/Close";

import {LOG_LEVEL} from "../../typings/logs";
import {
    DO_NOT_TIMEOUT_VALUE,
    PopupMessage,
} from "./index";


interface PopUpMessageProps {
    message: PopupMessage,
    onPopupMessagesChange: (callback: (value: PopupMessage[]) => PopupMessage[]) => void,
}

/**
 * Display a pop-up message in an alert box.
 *
 * @param props
 * @param props.message
 * @param props.onPopupMessagesChange
 * @return
 */
const PopUpMessageBox = ({message, onPopupMessagesChange}: PopUpMessageProps) => {
    const color = message.level >= LOG_LEVEL.ERROR ?
        "danger" :
        "primary";

    const handlePopUpMessageClose = useCallback(() => {
        onPopupMessagesChange((v) => v.filter((m) => m !== message));
    }, [
        message,
        onPopupMessagesChange,
    ]);

    useEffect(() => {
        if (DO_NOT_TIMEOUT_VALUE !== message.timeoutMillis) {
            setTimeout(handlePopUpMessageClose, message.timeoutMillis);
        }
    }, [
        handlePopUpMessageClose,
        message.timeoutMillis,
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
                        onClick={handlePopUpMessageClose}
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

export default PopUpMessageBox;
