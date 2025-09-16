import React, {useCallback} from "react";

import {
    Box,
    Input,
    Tooltip,
} from "@mui/joy";

import CollapseIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchIcon from "@mui/icons-material/Search";

import useUiStore from "../../stores/uiStore";
import useViewStore from "../../stores/viewStore";
import {UI_ELEMENT} from "../../typings/states";
import {isDisabled} from "../../utils/states";
import {updateWindowUrlHashParams} from "../../utils/url";
import {updateViewHashParams} from "../../utils/url/urlHash";
import MenuBarIconButton from "./MenuBarIconButton";

import "./TimestampQueryInput.css";


interface TimestampQueryInputProps {
    onInputCollapse: () => void;
}

/**
 * Renders an input allowing the user to jump to the nearest log event at or before a specified UTC
 * datetime. Collapses the input when requested.
 *
 * @param props
 * @param props.onInputCollapse
 * @return
 */
const TimestampQueryInput = ({onInputCollapse}: TimestampQueryInputProps) => {
    const uiState = useUiStore((state) => state.uiState);
    const dateTimeString = useViewStore((state) => state.dateTimeString);

    const handleTimestampQuery = useCallback(() => {
        const timestamp = new Date(`${dateTimeString}Z`).getTime();
        updateWindowUrlHashParams({timestamp: timestamp});
        updateViewHashParams();
    }, [dateTimeString]);

    const handleKeyboardEnterPress = useCallback((ev: React.KeyboardEvent<HTMLInputElement>) => {
        if ("Enter" === ev.key) {
            handleTimestampQuery();
        }
    }, [handleTimestampQuery]);

    const handleDateTimeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {setDateTimeString} = useViewStore.getState();
        setDateTimeString(e.currentTarget.value);
    }, []);

    return (
        <Box className={"timestamp-query-input"}>
            <Tooltip title={"Jump to the nearest log event at / before this UTC time"}>
                <Input
                    disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                    size={"sm"}
                    sx={{height: "100%"}}
                    title={"Timestamp to seek to in UTC"}
                    type={"datetime-local"}
                    value={dateTimeString}
                    endDecorator={
                        <MenuBarIconButton
                            onClick={handleTimestampQuery}
                        >
                            <SearchIcon/>
                        </MenuBarIconButton>
                    }
                    startDecorator={
                        <MenuBarIconButton
                            onClick={onInputCollapse}
                        >
                            <CollapseIcon/>
                        </MenuBarIconButton>
                    }
                    onChange={handleDateTimeInputChange}
                    onKeyDown={handleKeyboardEnterPress}/>
            </Tooltip>
        </Box>
    );
};

export default TimestampQueryInput;
