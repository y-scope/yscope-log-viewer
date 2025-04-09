import React, {useContext} from "react";

import {
    Button,
    Sheet,
    Tooltip,
    Typography,
} from "@mui/joy";

import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import AutoFixOffRoundedIcon from "@mui/icons-material/AutoFixOffRounded";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    updateWindowUrlHashParams,
    UrlContext,
} from "../../contexts/UrlContextProvider";
import {UI_ELEMENT} from "../../typings/states";
import {HASH_PARAM_NAMES} from "../../typings/url";
import {ACTION_NAME} from "../../utils/actions";
import {isDisabled} from "../../utils/states";
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
    const {uiState, numEvents} = useContext(StateContext);
    const {isPrettified, logEventNum} = useContext(UrlContext);

    const handleStatusButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const {actionName} = event.currentTarget.dataset;

        switch (actionName) {
            case ACTION_NAME.TOGGLE_PRETTIFY:
                updateWindowUrlHashParams({
                    [HASH_PARAM_NAMES.IS_PRETTIFIED]: !isPrettified,
                });
                break;
            default:
                console.error(`Unexpected action: ${actionName}`);
                break;
        }
    };

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

            <StatusBarToggleButton
                data-action-name={ACTION_NAME.TOGGLE_PRETTIFY}
                isActive={!isPrettified}
                offIcon={<AutoFixOffRoundedIcon/>}
                tooltipTitle={isPrettified ?? false ?
                    "Prettify Off" :
                    "Prettify On"}
                onClick={handleStatusButtonClick}
                onIcon={<AutoFixHighRoundedIcon/>}/>

            <LogLevelSelect/>
        </Sheet>
    );
};

export default StatusBar;
