import React, {useContext} from "react";

import {
    Button,
    Sheet,
    Tooltip,
    Typography,
} from "@mui/joy";

import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import AutoFixOffRoundedIcon from "@mui/icons-material/AutoFixOffRounded";

import {
    copyPermalinkToClipboard,
    updateWindowUrlHashParams,
    UrlContext,
} from "../../contexts/UrlContextProvider";
import useLogFileStore from "../../stores/logFileStore";
import useUiStore from "../../stores/uiStore";
import {UI_ELEMENT} from "../../typings/states";
import {HASH_PARAM_NAMES} from "../../typings/url";
import {ACTION_NAME} from "../../utils/actions";
import {isDisabled} from "../../utils/states";
import LogLevelSelect from "./LogLevelSelect";
import StatusBarToggleButton from "./StatusBarToggleButton";

import "./index.css";
import useViewStore from "../../stores/viewStore.ts";


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
    const isPrettified = useViewStore((state) => state.isPrettified);
    const setIsPrettified = useViewStore((state) => state.setIsPrettified);

    const handleStatusButtonClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
        const {actionName} = ev.currentTarget.dataset;

        switch (actionName) {
            case ACTION_NAME.TOGGLE_PRETTIFY:
                updateWindowUrlHashParams({
                    [HASH_PARAM_NAMES.IS_PRETTIFIED]: !isPrettified,
                });
                setIsPrettified(!isPrettified);
                break;
            default:
                console.error(`Unexpected action: ${actionName}`);
                break;
        }
    };

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

            <LogLevelSelect/>

            <StatusBarToggleButton
                data-action-name={ACTION_NAME.TOGGLE_PRETTIFY}
                disabled={isPrettifyButtonDisabled}
                isActive={isPrettified ?? false}
                icons={{
                    active: <AutoFixHighRoundedIcon/>,
                    inactive: <AutoFixOffRoundedIcon/>,
                }}
                tooltipTitle={isPrettified ?? false ?
                    "Turn off Prettify" :
                    "Turn on Prettify"}
                onClick={handleStatusButtonClick}/>
        </Sheet>
    );
};

export default StatusBar;
