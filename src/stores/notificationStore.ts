import {create} from "zustand";

import {WithId} from "../typings/common";
import {LOG_LEVEL} from "../typings/logs";
import {
    DO_NOT_TIMEOUT_VALUE,
    PopUpMessage,
} from "../typings/notifications";


interface NotificationValues {
    popUpMessages: WithId<PopUpMessage>[];
}

interface NotificationActions {
    handlePopUpMessageClose: (messageId: number) => void;
    postPopUp: (message: PopUpMessage) => void;
}

type NotificationState = NotificationValues & NotificationActions;

const NOTIFICATION_STORE_DEFAULT: NotificationValues = {
    popUpMessages: [],
};

/**
 * Counter for generating unique IDs for pop-up messages.
 */
let nextPopUpMessageId = 0;

const useNotificationStore = create<NotificationState>((set) => ({
    ...NOTIFICATION_STORE_DEFAULT,
    handlePopUpMessageClose: (messageId: number) => {
        set((state) => ({
            popUpMessages: state.popUpMessages.filter((m) => m.id !== messageId),
        }));
    },
    postPopUp: (message: PopUpMessage) => {
        const newMessage = {
            id: nextPopUpMessageId,
            ...message,
        };

        nextPopUpMessageId++;

        set((state) => ({
            popUpMessages: [
                newMessage,
                ...state.popUpMessages,
            ],
        }));
    },
}));

/**
 * Handles error messages by logging them to the console and posting a notification.
 *
 * @param e
 */
const handleErrorWithNotification = (e: unknown) => {
    console.error(e);

    const {postPopUp} = useNotificationStore.getState();
    postPopUp({
        level: LOG_LEVEL.ERROR,
        message: String(e),
        timeoutMillis: DO_NOT_TIMEOUT_VALUE,
        title: "Action failed",
    });
};

export type {PopUpMessage};
export {handleErrorWithNotification};
export default useNotificationStore;
