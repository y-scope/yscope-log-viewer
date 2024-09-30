import React, {
    createContext,
    useCallback,
    useRef,
    useState,
} from "react";

import {
    Box,
    ModalClose,
    Snackbar,
    Stack,
    Typography,
} from "@mui/joy";

import {Nullable} from "../typings/common";
import {LOG_LEVEL} from "../typings/logs";


interface NotificationContextType {
    statusMessage: string,

    postPopup: (level: LOG_LEVEL, message: string, title?: string) => void,
    postStatus: (level: LOG_LEVEL, message: string) => void,
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

interface NotificationContextProvider {
    children: React.ReactNode;
}

/**
 *
 */
const NOTIFICATION_DEFAULT: Readonly<NotificationContextType> = Object.freeze({
    statusMessage: "",

    postPopup: () => null,
    postStatus: () => null,
});

interface PopupNotification {
    level: LOG_LEVEL,
    message: string,
    title: string
}

/**
 *
 * @param props
 * @param props.children
 */
const NotificationContextProvider = ({children}: NotificationContextProvider) => {
    const [popupNotification, setPopupNotification] = useState<Nullable<PopupNotification>>(null);
    const [statusMessage, setStatusMessage] = useState<string>(NOTIFICATION_DEFAULT.statusMessage);
    const popupNotificationTimeoutRef = useRef<Nullable<ReturnType<typeof setTimeout>>>(null);
    const statusMsgTimeoutRef = useRef<Nullable<ReturnType<typeof setTimeout>>>(null);

    const postPopup = useCallback((level: LOG_LEVEL, message: string, title: string = "") => {
        if (null !== popupNotificationTimeoutRef.current) {
            clearTimeout(popupNotificationTimeoutRef.current);
        }
        setPopupNotification(null);
        setPopupNotification({
            level: level,
            message: message,
            title: "" === title ?
                LOG_LEVEL[level] :
                title,
        });

        if (LOG_LEVEL.INFO >= level) {
            popupNotificationTimeoutRef.current = setTimeout(() => {
                setPopupNotification(null);
            }, 5000);
        }
    }, []);

    const postStatus = useCallback((level: LOG_LEVEL, message: string) => {
        if (null !== statusMsgTimeoutRef.current) {
            clearTimeout(statusMsgTimeoutRef.current);
        }
        setStatusMessage(message);

        if (LOG_LEVEL.INFO >= level) {
            statusMsgTimeoutRef.current = setTimeout(() => {
                setStatusMessage(NOTIFICATION_DEFAULT.statusMessage);
            }, 5000);
        }
    }, []);


    return (
        <NotificationContext.Provider
            value={{
                statusMessage: statusMessage,
                postPopup: postPopup,
                postStatus: postStatus,
            }}
        >
            {children}
            {null !== popupNotification && <Snackbar
                open={true}
                sx={{right: "14px", bottom: "32px"}}
                color={popupNotification.level >= LOG_LEVEL.ERROR ?
                    "danger" :
                    "primary"}
            >
                <Stack>
                    <Box>
                        <Typography
                            level={"title-sm"}
                            color={popupNotification.level >= LOG_LEVEL.ERROR ?
                                "danger" :
                                "primary"}
                        >
                            {popupNotification.title}
                        </Typography>
                        <ModalClose
                            size={"sm"}
                            onClick={() => { setPopupNotification(null); }}/>
                    </Box>
                    <Typography level={"body-sm"}>
                        {popupNotification.message}
                    </Typography>
                </Stack>
            </Snackbar>}
        </NotificationContext.Provider>
    );
};

export {NotificationContext};
export default NotificationContextProvider;
