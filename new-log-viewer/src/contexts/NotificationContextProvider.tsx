import React, {
    createContext,
    useCallback,
    useRef,
    useState,
} from "react";

import {WithId} from "../typings/common";
import {PopupMessage} from "../typings/notifications";


interface NotificationContextType {
    popupMessages: WithId<PopupMessage>[],

    handlePopupMessageClose: (messageId: number) => void;
    postPopup: (message: PopupMessage) => void,
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

/**
 * Default values of the Notification context value object.
 */
const NOTIFICATION_DEFAULT: Readonly<NotificationContextType> = Object.freeze({
    popupMessages: [],

    handlePopupMessageClose: () => {},
    postPopup: () => {},
});


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
    const [popupMessages, setPopupMessages] = useState<WithId<PopupMessage>[]>(
        NOTIFICATION_DEFAULT.popupMessages
    );
    const nextPopUpMessageIdRef = useRef<number>(0);

    const postPopup = useCallback((message:PopupMessage) => {
        const newMessage = {
            id: nextPopUpMessageIdRef.current,
            ...message,
        };

        nextPopUpMessageIdRef.current++;

        setPopupMessages((v) => ([
            newMessage,
            ...v,
        ]));
    }, []);

    const handlePopupMessageClose = useCallback((messageId: number) => {
        // Keep everything but except input message.
        setPopupMessages((popups) => popups.filter((m) => m.id !== messageId));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                popupMessages: popupMessages,
                handlePopupMessageClose: handlePopupMessageClose,
                postPopup: postPopup,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export {NotificationContext};
export type {PopupMessage};
export default NotificationContextProvider;
