import React, {
    createContext,
    useCallback,
    useState,
} from "react";

import {Nullable} from "../typings/common";
import {LOG_LEVEL} from "../typings/logs";


interface PopupMessage {
    level: LOG_LEVEL,
    message: string,
    timeoutMillis: Nullable<number>,
    title: string,
}

interface NotificationContextType {
    popUpMessages: PopupMessage[],

    handlePopUpMessageClose: (message: PopupMessage) => void;
    postPopup: (message: PopupMessage) => void,
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

/**
 * Default values of the Notification context value object.
 */
const NOTIFICATION_DEFAULT: Readonly<NotificationContextType> = Object.freeze({
    popUpMessages: [],

    handlePopUpMessageClose: () => {},
    postPopup: () => {},
});

/**
 * The default duration in milliseconds after which an automatic dismissal will occur.
 */
const DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS = 10_000;

/**
 * A value that indicates that a pop-up message should not be automatically dismissed.
 */
const DO_NOT_TIMEOUT_VALUE = null;

interface NotificationContextProviderProps {
    children: React.ReactNode,
}

/**
 * Provides notification management for the application. This provider must be at the outermost
 * layer of subscriber / publisher components to ensure they can receive / publish notifications.
 *
 * @param props
 * @param props.children
 * @return
 */
const NotificationContextProvider = ({children}: NotificationContextProviderProps) => {
    const [popUpMessages, setPopUpMessages] = useState<PopupMessage[]>(
        NOTIFICATION_DEFAULT.popUpMessages
    );

    const postPopup = useCallback(({level, message, timeoutMillis, title}:PopupMessage) => {
        const newMessage = {
            level: level,
            message: message,
            timeoutMillis: timeoutMillis,
            title: "" === title ?
                LOG_LEVEL[level] :
                title,
        };

        setPopUpMessages((v) => ([
            ...v,
            newMessage,
        ]));
    }, []);

    const handlePopUpMessageClose = useCallback((message: PopupMessage) => {
        setPopUpMessages((v) => v.filter((m) => m !== message));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                popUpMessages: popUpMessages,
                handlePopUpMessageClose: handlePopUpMessageClose,
                postPopup: postPopup,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export {
    DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS,
    DO_NOT_TIMEOUT_VALUE,
    NotificationContext,
};
export type {PopupMessage};
export default NotificationContextProvider;
