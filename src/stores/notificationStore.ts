import {create} from "zustand";

import {WithId} from "../typings/common";
import {PopUpMessage} from "../typings/notifications";


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

export type {PopUpMessage};
export default useNotificationStore;
