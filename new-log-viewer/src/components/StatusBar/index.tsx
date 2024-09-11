import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";

import {copyPermalinkToClipboard} from "../../contexts/UrlContextProvider";

import "./index.css";


interface StatusBarProps {
    logEventNum: number | null;
    numEvents: number | null;
}

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
 * @param props The properties object.
 * @param props.logEventNum The current log event number.
 * @param props.numEvents The total number of events.
 * @return The rendered StatusBar component.
 */
const StatusBar = ({logEventNum, numEvents}: StatusBarProps) => {
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
