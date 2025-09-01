import {useCallback} from "react";

import {
    Box,
    Input,
    Tooltip,
} from "@mui/joy";

import SearchIcon from "@mui/icons-material/Search";

import useUiStore from "../../stores/uiStore";
import {UI_ELEMENT} from "../../typings/states";
import {isDisabled} from "../../utils/states";
import {updateWindowUrlHashParams} from "../../utils/url";
import {updateViewHashParams} from "../../utils/url/urlHash";
import MenuBarIconButton from "./MenuBarIconButton";

import "./TimestampQueryBox.css";


const currentUtcTime = new Date().toISOString()
    .slice(0, -1);

/**
 * Perform timestamp query with the datetime string.
 *
 * @param datetime
 */
const handleTimestampQuery = (datetime: string) => {
    if (datetime) {
        const timestamp = new Date(`${datetime}Z`).getTime();
        updateWindowUrlHashParams({timestamp: timestamp});
        updateViewHashParams();
    }
};

/**
 * Handle "Enter" key press event to trigger timestamp query.
 *
 * @param e Keyboard event
 */
const handleKeyboardEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ("Enter" === e.key) {
        handleTimestampQuery(e.currentTarget.value);
    }
};

/**
 * Renders a timestamp input field and a search icon button.
 * Users can input a date and time in UTC format and either press "Enter"
 * or click the search button to update the application's state and URL hash parameters.
 *
 * @return
 */
const TimestampQueryBox = () => {
    const uiState = useUiStore((state) => state.uiState);
    const searchByTimestamp = useCallback(() => {
        const input = document.getElementById(
            "timestamp-query-box-input",
        ) as HTMLInputElement;

        handleTimestampQuery(input.value);
    }, []);

    return (
        <Box className={"timestamp-query-box"}>
            <Tooltip title={"Jump to last log event at or first log event after this UTC time"}>
                <Input
                    defaultValue={currentUtcTime}
                    disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                    id={"timestamp-query-box-input"}
                    title={"Timestamp to seek to in UTC"}
                    type={"datetime-local"}
                    onKeyDown={handleKeyboardEnterPress}/>
            </Tooltip>
            <MenuBarIconButton
                disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                tooltipTitle={"Search by timestamp"}
                onClick={searchByTimestamp}
            >
                <SearchIcon/>
            </MenuBarIconButton>
        </Box>
    );
};

export default TimestampQueryBox;
