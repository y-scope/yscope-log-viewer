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


type PostPopupCallback = (level: LOG_LEVEL, message: string, title?: string) => void;
type PostStatusCallback = (level: LOG_LEVEL, message: string, title?: string) => void;

interface NotificationContextType {
    statusMessage: string,

    postPopup: PostPopupCallback,
    postStatus: PostStatusCallback,
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

interface NotificationContextProviderProps {
    children: React.ReactNode;
}

/**
 * Default values of the notification value object.
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
 * Provides notification management for the application. This provider must be at the outermost
 * layer to ensure that both direct and indirect child components can publish and subscribe to
 * notifications.
 *
 * @param props
 * @param props.children
 * @return
 */
const NotificationContextProvider = ({children}: NotificationContextProviderProps) => {
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

export type {
    PostPopupCallback,
    PostStatusCallback,
};
export {NotificationContext};
export default NotificationContextProvider;
