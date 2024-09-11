import {useContext} from "react";

import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    UrlContext,
} from "../../contexts/UrlContextProvider";

import "./index.css";


/**
 * Handles the click event for the "Copy Link" button.
 * Copies the permalink to the clipboard.
 */
const handleCopyLinkButtonClick = () => {
    copyPermalinkToClipboard({}, {});
};

/**
 * StatusBar component displays the current log event number and total number of events.
 *
 * @return
 */
const StatusBar = () => {
    const {numEvents} = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    return (
        <Sheet className={"status-bar"}>
            <Typography
                className={"status-message"}
                level={"body-sm"}
            >
                Status message
            </Typography>
            <Button
                className={"status-button"}
                size={"sm"}
                onClick={handleCopyLinkButtonClick}
            >
                Log Event
                {" "}
                {logEventNum}
                {" "}
                of
                {" "}
                {numEvents}
            </Button>
        </Sheet>
    );
};

export default StatusBar;