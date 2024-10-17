import {
    useContext,
    useEffect,
    useRef,
} from "react";

import {
    Snackbar,
    Stack,
} from "@mui/joy";

import {NotificationContext} from "../../contexts/NotificationContextProvider";
import PopupMessageBox from "./PopupMessageBox";

import "./index.css";


/**
 * Displays popups.
 *
 * @return
 */
const Popups = () => {
    const {popupMessages} = useContext(NotificationContext);
    const containerStackRef = useRef<HTMLDivElement>(null);

    // On `popupMessages` update, scroll to the very top of the container.
    useEffect(() => {
        if (null === containerStackRef.current) {
            // The component is mounted yet.
            return;
        }

        // The negative sign is necessary because the Stack is in "column-reverse" direction.
        containerStackRef.current.scrollTo({top: -containerStackRef.current.scrollHeight});
    }, [popupMessages]);

    return (
        <Snackbar
            className={"pop-up-messages-container-snackbar"}
            open={0 < popupMessages.length}
        >
            <Stack
                className={"pop-up-messages-container-stack"}
                direction={"column-reverse"}
                gap={1}
                ref={containerStackRef}
            >
                {popupMessages.map((message) => (
                    <PopupMessageBox
                        key={message.id}
                        message={message}/>
                ))}
            </Stack>
        </Snackbar>
    );
};

export default Popups;
