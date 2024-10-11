import React, {
    createContext,
    useCallback,
    useState,
} from "react";

import {Nullable} from "../../typings/common";
import {LOG_LEVEL} from "../../typings/logs";
import PopUpMessagesContainer from "./PopUpMessagesContainer";

import "./index.css";


/**
 * The default duration in milliseconds after which an automatic dismissal will occur.
 */
const DEFAULT_AUTO_DISMISS_TIMEOUT_MILLIS = 10_000;

/**
 * A value that indicates that a pop-up message should not be automatically dismissed.
 */
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
 * layer of subscriber / publisher components to ensure they can receive / publish notifications.
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
            <PopUpMessagesContainer
                popupMessages={popupMessages}
                onPopupMessagesChange={setPopupMessages}/>
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
