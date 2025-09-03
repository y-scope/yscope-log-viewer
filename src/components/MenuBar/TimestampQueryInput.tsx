import React, {useCallback} from "react";

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

import "./TimestampQueryInput.css";


/**
 * Renders a timestamp input field and a search icon button.
 * Users can input a date and time in UTC format and either press "Enter"
 * or click the search button to update the application's state and URL hash parameters.
 *
 * @return
 */
const TimestampQueryInput = () => {
    const uiState = useUiStore((state) => state.uiState);
    const dateTimeString = useViewStore((state) => state.dateTimeString);

    const handleTimestampQuery = useCallback(() => {
        const timestamp = new Date(`${dateTimeString}Z`).getTime();
        updateWindowUrlHashParams({timestamp: timestamp});
        updateViewHashParams();
    }, [dateTimeString]);

    const handleKeyboardEnterPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if ("Enter" === e.key) {
            handleTimestampQuery();
        }
    }, [handleTimestampQuery]);

    const handleDateTimeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {setDateTimeString} = useViewStore.getState();
        setDateTimeString(e.currentTarget.value);
    }, []);

    return (
        <Box className={"timestamp-query-input"}>
            <Tooltip title={"Jump to the nearest log event at/after this UTC time"}>
                <Input
                    disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                    size={"sm"}
                    title={"Timestamp to seek to in UTC"}
                    type={"datetime-local"}
                    value={dateTimeString}
                    endDecorator={
                        <MenuBarIconButton
                            disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                            tooltipTitle={"Search by timestamp"}
                            onClick={handleTimestampQuery}
                        >
                            <SearchIcon/>
                        </MenuBarIconButton>
                    }
                    onChange={handleDateTimeInputChange}
                    onKeyDown={handleKeyboardEnterPress}/>
            </Tooltip>

        </Box>
    );
};

export default TimestampQueryInput;
