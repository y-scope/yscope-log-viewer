import {useContext} from "react";

import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    UrlContext,
} from "../../contexts/UrlContextProvider";
import {
    isDisabled,
    UI_ELEMENT,
} from "../../utils/states";
import LogLevelSelect from "./LogLevelSelect";

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
    const {uiState, numEvents} = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    return (
        <Sheet className={"status-bar"}>
            <Typography className={"status-message"}>
                {/* This is left blank intentionally until status messages are implemented. */}
            </Typography>
            <Button
                color={"primary"}
                disabled={isDisabled(uiState, UI_ELEMENT.LOG_EVENT_NUM_DISPLAY)}
                size={"sm"}
                variant={"soft"}
                onClick={handleCopyLinkButtonClick}
            >
                {"Log Event "}
                {logEventNum}
                {" / "}
                {numEvents}
            </Button>
            <LogLevelSelect/>
        </Sheet>
    );
};

export default StatusBar;
