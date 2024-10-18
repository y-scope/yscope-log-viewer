import React, {
    createContext,
    useCallback,
    useRef,
    useState,
} from "react";

import {WithId} from "../typings/common";
import {PopUpMessage} from "../typings/notifications";


interface NotificationContextType {
    popUpMessages: WithId<PopUpMessage>[],

    handlePopUpMessageClose: (messageId: number) => void;
    postPopUp: (message: PopUpMessage) => void,
}

const NotificationContext = createContext({} as NotificationContextType);

/**
 * Default values of the Notification context value object.
 */
const NOTIFICATION_DEFAULT: Readonly<NotificationContextType> = Object.freeze({
    popUpMessages: [],

    handlePopUpMessageClose: () => {},
    postPopUp: () => {},
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
    const [popUpMessages, setPopUpMessages] = useState<WithId<PopUpMessage>[]>(
        NOTIFICATION_DEFAULT.popUpMessages
    );
    const nextPopUpMessageIdRef = useRef<number>(0);

    const postPopUp = useCallback((message:PopUpMessage) => {
        const newMessage = {
            id: nextPopUpMessageIdRef.current,
            ...message,
        };

        nextPopUpMessageIdRef.current++;

        setPopUpMessages((v) => ([
            newMessage,
            ...v,
        ]));
    }, []);

    const handlePopUpMessageClose = useCallback((messageId: number) => {
        // Keep everything but except input message.
        setPopUpMessages((v) => v.filter((m) => m.id !== messageId));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                popUpMessages: popUpMessages,
                handlePopUpMessageClose: handlePopUpMessageClose,
                postPopUp: postPopUp,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export {NotificationContext};
export type {PopUpMessage};
export default NotificationContextProvider;
