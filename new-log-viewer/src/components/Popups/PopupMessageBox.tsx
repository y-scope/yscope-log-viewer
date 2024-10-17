import {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    Typography,
} from "@mui/joy";

import CloseIcon from "@mui/icons-material/Close";

import {
    NotificationContext,
    PopupMessage,
} from "../../contexts/NotificationContextProvider";
import {WithId} from "../../typings/common";
import {LOG_LEVEL} from "../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../typings/notifications";


const AUTO_DISMISS_PERCENT_UPDATE_INTERVAL_MILLIS = 50;

interface PopupMessageProps {
    message: WithId<PopupMessage>,
}

/**
 * Display a pop-up message in an alert box.
 *
 * @param props
 * @param props.message
 * @return
 */
const PopupMessageBox = ({message}: PopupMessageProps) => {
    const {id, level, message: messageStr, title, timeoutMillis} = message;

    const {handlePopupMessageClose} = useContext(NotificationContext);
    const [intervalCount, setIntervalCount] = useState<number>(0);

    const handleCloseButtonClick = () => {
        handlePopupMessageClose(id);
    };

    useEffect(() => {
        if (DO_NOT_TIMEOUT_VALUE === timeoutMillis) {
            return () => {};
        }
        const intervalId = setInterval(() => {
            setIntervalCount((c) => c + 1);
        }, AUTO_DISMISS_PERCENT_UPDATE_INTERVAL_MILLIS);

        return () => {
            clearInterval(intervalId);
        };
    }, [
        timeoutMillis,
        handlePopupMessageClose,
    ]);

    const color = level >= LOG_LEVEL.ERROR ?
        "danger" :
        "primary";

    let percentRemaining = 100;
    if (DO_NOT_TIMEOUT_VALUE !== timeoutMillis) {
        const totalIntervals = timeoutMillis / AUTO_DISMISS_PERCENT_UPDATE_INTERVAL_MILLIS;
        percentRemaining = 100 - (100 * (intervalCount / totalIntervals));
        if (0 >= percentRemaining) {
            setTimeout(() => {
                handlePopupMessageClose(id);
            }, 0);
        }
    }

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
                        {title}
                    </Typography>
                    <CircularProgress
                        color={color}
                        determinate={true}
                        size={"sm"}
                        thickness={2}
                        value={percentRemaining}
                    >
                        <IconButton
                            className={"pop-up-message-box-close-button"}
                            color={color}
                            size={"sm"}
                            onClick={handleCloseButtonClick}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </CircularProgress>
                </Box>
                <Typography level={"body-sm"}>
                    {messageStr}
                </Typography>
            </div>
        </Alert>
    );
};

export default PopupMessageBox;
