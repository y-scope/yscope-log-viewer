import {useContext} from "react";

import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    UrlContext,
} from "../../contexts/UrlContextProvider";
import {LOAD_STATE} from "../../typings/worker";

import "./index.css";


/**
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
    const {loadState, numEvents} = useContext(StateContext);
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
                disabled={loadState === LOAD_STATE.UNOPENED}
                size={"sm"}
                onClick={handleCopyLinkButtonClick}
            >
                Log Event
                {" "}
                {logEventNum}
                {" / "}
                {numEvents}
            </Button>
        </Sheet>
    );
};

export default StatusBar;
