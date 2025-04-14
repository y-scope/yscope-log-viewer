import {useContext} from "react";

import {
    Button,
    Sheet,
    Tooltip,
    Typography,
} from "@mui/joy";

import useLogFileStore from "../../contexts/states/logFileStore";
import useUiStore from "../../contexts/states/uiStore";
import {
    copyPermalinkToClipboard,
    UrlContext,
} from "../../contexts/UrlContextProvider";
import {UI_ELEMENT} from "../../typings/states";
import {isDisabled} from "../../utils/states";
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
    const numEvents = useLogFileStore((state) => state.numEvents);
    const uiState = useUiStore((state) => state.uiState);
    const {logEventNum} = useContext(UrlContext);

    return (
        <Sheet className={"status-bar"}>
            <Typography className={"status-message"}>
                {/* This is left blank intentionally until status messages are implemented. */}
            </Typography>

            <Tooltip title={"Copy link to clipboard"}>
                <span>
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
                </span>
            </Tooltip>

            <LogLevelSelect/>
        </Sheet>
    );
};

export default StatusBar;
