import React, {
    createContext,
    useCallback,
    useState,
} from "react";

import {
    Alert,
    Box,
    IconButton,
    Snackbar,
    Stack,
    Typography,
} from "@mui/joy";

import CloseIcon from "@mui/icons-material/Close";

import {Nullable} from "../typings/common";
import {LOG_LEVEL} from "../typings/logs";


const AUTO_DISMISS_TIMEOUT_MILLIS = 5000;
const DO_NOT_TIMEOUT_VALUE = null;

interface NotificationContextType {
    postPopup: (
        level: LOG_LEVEL,
        message: string,
        title: string,
        timeoutMillis: Nullable<number>
    ) => void,
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

interface NotificationContextProviderProps {
    children: React.ReactNode;
}

interface PopupMessage {
    level: LOG_LEVEL,
    message: string,
    title: string,
    timeout: Nullable<ReturnType<typeof setTimeout>>
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
    const [popupMessages, setPopupMessages] = useState<PopupMessage[]>([]);

    const postPopup = useCallback((
        level: LOG_LEVEL,
        message: string,
        title: string,
        timeoutMillis: Nullable<number>
    ) => {
        const newMessage = {
            level: level,
            message: message,
            title: "" === title ?
                LOG_LEVEL[level] :
                title,
            timeout: null === timeoutMillis ?
                null :
                setTimeout(() => {
                    setPopupMessages((v) => v.filter((m) => m !== newMessage));
                }, timeoutMillis),
        };

        setPopupMessages((v) => ([
            ...v,
            newMessage,
        ]));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                postPopup: postPopup,
            }}
        >
            {children}
            <Snackbar
                open={0 < popupMessages.length}
                sx={{
                    background: "transparent",
                    border: "none",
                    bottom: "32px",
                    boxShadow: "none",
                    right: "14px",
                }}
            >
                <Stack gap={1}>
                    {popupMessages.map((m, index) => (
                        <Alert
                            key={index}
                            sx={{paddingX: "18px"}}
                            variant={"outlined"}
                            color={m.level >= LOG_LEVEL.ERROR ?
                                "danger" :
                                "primary"}
                        >
                            <Stack>
                                <Box sx={{display: "flex", alignItems: "center"}}>
                                    <Typography
                                        level={"title-sm"}
                                        sx={{flexGrow: 1}}
                                        color={m.level >= LOG_LEVEL.ERROR ?
                                            "danger" :
                                            "primary"}
                                    >
                                        {m.title}
                                    </Typography>
                                    <IconButton
                                        size={"sm"}
                                        color={m.level >= LOG_LEVEL.ERROR ?
                                            "danger" :
                                            "primary"}
                                        onClick={() => {
                                            setPopupMessages((v) => v.filter((vm) => vm !== m));
                                        }}
                                    >
                                        <CloseIcon/>
                                    </IconButton>
                                </Box>
                                <Typography level={"body-sm"}>
                                    {m.message}
                                </Typography>
                            </Stack>
                        </Alert>
                    ))}
                </Stack>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export {
    AUTO_DISMISS_TIMEOUT_MILLIS,
    DO_NOT_TIMEOUT_VALUE,
    NotificationContext,
};
export default NotificationContextProvider;
