import {useCallback} from "react";

import {
    Box,
    Input,
    Tooltip,
} from "@mui/joy";

import SearchIcon from "@mui/icons-material/Search";

import useUiStore from "../../stores/uiStore";
import useViewStore from "../../stores/viewStore";
import {UI_ELEMENT} from "../../typings/states";
import {isDisabled} from "../../utils/states";
import {updateWindowUrlHashParams} from "../../utils/url";
import {updateViewHashParams} from "../../utils/url/urlHash";
import MenuBarIconButton from "./MenuBarIconButton";

import "./TimestampQueryBox.css";


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
    const dateTimeString = useViewStore((state) => state.dateTimeString);
    const searchByTimestamp = useCallback(() => {
        const input = document.getElementById(
            "timestamp-query-box-input",
        ) as HTMLInputElement;

        handleTimestampQuery(input.value);
    }, []);
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {setDateTimeString} = useViewStore.getState();
        setDateTimeString(e.currentTarget.value);
    }, []);

    return (
        <Box className={"timestamp-query-box"}>
            <Tooltip title={"Jump to last log event at or first log event after this UTC time"}>
                <Input
                    disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                    id={"timestamp-query-box-input"}
                    title={"Timestamp to seek to in UTC"}
                    type={"datetime-local"}
                    value={dateTimeString}
                    onChange={handleChange}
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
