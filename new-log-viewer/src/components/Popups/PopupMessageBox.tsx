import {
    useContext,
    useEffect,
    useRef,
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
    DO_NOT_TIMEOUT_VALUE,
    NotificationContext,
    PopupMessage,
} from "../../contexts/NotificationContextProvider";
import {
    Nullable,
    WithId,
} from "../../typings/common";
import {LOG_LEVEL} from "../../typings/logs";


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
    const {handlePopupMessageClose} = useContext(NotificationContext);
    const [timeoutPercent, setTimeoutPercent] = useState<number>(0);
    const startTimeMillisRef = useRef<number>(Date.now());

    const handleCloseButtonClick = () => {
        handlePopupMessageClose(message.id);
    };

    useEffect(() => {
        const {timeoutMillis} = message;
        let timeoutId: Nullable<ReturnType<typeof setTimeout>> = null;
        let intervalId: Nullable<ReturnType<typeof setInterval>> = null;
        if (DO_NOT_TIMEOUT_VALUE !== timeoutMillis) {
            timeoutId = setTimeout(() => {
                handlePopupMessageClose(message.id);
            }, timeoutMillis);
            intervalId = setInterval(() => {
                const fraction = (Date.now() - startTimeMillisRef.current) / timeoutMillis;
                setTimeoutPercent(100 - (100 * fraction));
            }, AUTO_DISMISS_PERCENT_UPDATE_INTERVAL_MILLIS);
        }

        return () => {
            if (null !== timeoutId) {
                clearTimeout(timeoutId);
            }
            if (null !== intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [
        message,
        handlePopupMessageClose,
    ]);

    const color = message.level >= LOG_LEVEL.ERROR ?
        "danger" :
        "primary";

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
                    <CircularProgress
                        color={color}
                        determinate={true}
                        size={"sm"}
                        thickness={2}
                        value={timeoutPercent}
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
                    {message.message}
                </Typography>
            </div>
        </Alert>
    );
};

export default PopupMessageBox;
