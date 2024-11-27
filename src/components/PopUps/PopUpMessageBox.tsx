import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Typography,
} from "@mui/joy";

import CloseIcon from "@mui/icons-material/Close";

import {
    NotificationContext,
    PopUpMessage,
} from "../../contexts/NotificationContextProvider";
import {WithId} from "../../typings/common";
import {LOG_LEVEL} from "../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../typings/notifications";


const AUTO_DISMISS_PERCENT_UPDATE_INTERVAL_MILLIS = 50;

interface PopUpMessageProps {
    message: WithId<PopUpMessage>,
}

/**
 * Displays a pop-up message in an alert box with an optional action button. The pop-up can
 * be manually dismissed or will automatically close after the specified `timeoutMillis`.
 * If `timeoutMillis` is `0`, the pop-up will remain open until manually closed.
 *
 * @param props
 * @param props.message
 * @return
 */
const PopUpMessageBox = ({message}: PopUpMessageProps) => {
    const {id, level, primaryAction, message: messageStr, title, timeoutMillis} = message;

    const {handlePopUpMessageClose} = useContext(NotificationContext);
    const [percentRemaining, setPercentRemaining] = useState<number>(100);
    const intervalCountRef = useRef<number>(0);

    const handleCloseButtonClick = () => {
        handlePopUpMessageClose(id);
    };

    const handlePrimaryActionClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
        primaryAction?.onClick?.(ev);
        handleCloseButtonClick();
    };

    useEffect(() => {
        if (DO_NOT_TIMEOUT_VALUE === timeoutMillis) {
            return () => {};
        }

        const totalIntervals = Math.ceil(
            timeoutMillis / AUTO_DISMISS_PERCENT_UPDATE_INTERVAL_MILLIS
        );
        const intervalId = setInterval(() => {
            intervalCountRef.current++;
            const newPercentRemaining = 100 - (100 * (intervalCountRef.current / totalIntervals));
            if (0 >= newPercentRemaining) {
                handlePopUpMessageClose(id);
            }
            setPercentRemaining(newPercentRemaining);
        }, AUTO_DISMISS_PERCENT_UPDATE_INTERVAL_MILLIS);

        return () => {
            clearInterval(intervalId);
        };
    }, [
        timeoutMillis,
        handlePopUpMessageClose,
        id,
    ]);

    const color = level >= LOG_LEVEL.ERROR ?
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
                        {title}
                    </Typography>
                    <CircularProgress
                        color={color}
                        determinate={true}
                        size={"sm"}
                        thickness={3}
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
                {primaryAction && (
                    <Box className={"pop-up-message-box-actions-container"}>
                        <Button
                            color={color}
                            variant={"solid"}
                            {...primaryAction}
                            onClick={handlePrimaryActionClick}
                        >
                            {primaryAction.children}
                        </Button>
                    </Box>
                )}
            </div>
        </Alert>
    );
};

export default PopUpMessageBox;
