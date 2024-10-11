import {
    Snackbar,
    Stack,
} from "@mui/joy";

import {PopupMessage} from "./index";
import PopUpMessageBox from "./PopUpMessageBox";


interface PopUpMessagesContainerProps {
    popupMessages: PopupMessage[],
    onPopupMessagesChange: (callback: (value: PopupMessage[]) => PopupMessage[]) => void
}

/**
 * Display a container for pop-up messages that appears at the bottom-right of the screen.
 *
 * @param props
 * @param props.popupMessages
 * @param props.onPopupMessagesChange
 * @return
 */
const PopUpMessagesContainer = ({
    popupMessages,
    onPopupMessagesChange,
}: PopUpMessagesContainerProps) => {
    return (
        <Snackbar
            className={"pop-up-messages-container-snackbar"}
            open={0 < popupMessages.length}
        >
            <Stack gap={1}>
                {popupMessages.map((message, index) => (
                    <PopUpMessageBox
                        key={index}
                        message={message}
                        onPopupMessagesChange={onPopupMessagesChange}/>
                ))}
            </Stack>
        </Snackbar>
    );
};

export default PopUpMessagesContainer;
