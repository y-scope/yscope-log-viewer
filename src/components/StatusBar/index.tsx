import {
    Button,
    Divider,
    Sheet,
    Tooltip,
    Typography,
} from "@mui/joy";

import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AutoFixOffIcon from "@mui/icons-material/AutoFixOff";

import useLogFileStore from "../../stores/logFileStore";
import useUiStore from "../../stores/uiStore";
import useViewStore from "../../stores/viewStore";
import {ACTION_NAME} from "../../typings/actions";
import {UI_ELEMENT} from "../../typings/states";
import {isDisabled} from "../../utils/states";
import {copyPermalinkToClipboard} from "../../utils/url";
import {togglePrettify} from "../../utils/url/urlHash";
import LogLevelSelect from "./LogLevelSelect";
import StatusBarToggleButton from "./StatusBarToggleButton";

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
    const isPrettified = useViewStore((state) => state.isPrettified);
    const logEventNum = useViewStore((state) => state.logEventNum);
    const numEvents = useLogFileStore((state) => state.numEvents);
    const uiState = useUiStore((state) => state.uiState);

    const isPrettifyButtonDisabled = isDisabled(uiState, UI_ELEMENT.PRETTIFY_BUTTON);

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
            <Divider orientation={"vertical"}/>

            <LogLevelSelect/>
            <Divider orientation={"vertical"}/>

            <StatusBarToggleButton
                data-action-name={ACTION_NAME.TOGGLE_PRETTIFY}
                disabled={isPrettifyButtonDisabled}
                isActive={isPrettified}
                tooltipPlacement={"top-end"}
                icons={{
                    active: <AutoFixHighIcon/>,
                    inactive: <AutoFixOffIcon/>,
                }}
                tooltipTitle={false === isPrettified ?
                    "Turn on Prettify" :
                    "Turn off Prettify"}
                onClick={togglePrettify}/>
        </Sheet>
    );
};

export default StatusBar;
