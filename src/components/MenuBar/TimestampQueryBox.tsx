import {Box} from "@mui/joy";

import SearchIcon from "@mui/icons-material/Search";

import useUiStore from "../../stores/uiStore";
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
const searchByDateTime = (datetime: string) => {
    if (datetime) {
        const timestamp = new Date(`${datetime}Z`).getTime();
        updateWindowUrlHashParams({timestamp: timestamp});
        updateViewHashParams();
    }
};


/**
 * renders a timestamp input field and a search icon button.
 * Users can input a date and time in UTC format and either press "Enter"
 * or click the search button to update the application's state and URL hash parameters.
 *
 * @return
 */
const TimestampQueryBox = () => {
    const uiState = useUiStore((state) => state.uiState);
    return (
        <Box className={"timestamp-query-box"}>
            <input
                className={"timestamp-query-box-input"}
                disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                id={"timestamp-query-box-input"}
                step={"0.1"}
                title={"Input date and time in UTC"}
                type={"datetime-local"}
                onKeyDown={(e) => {
                    if ("Enter" === e.key) {
                        searchByDateTime(e.currentTarget.value);
                    }
                }}/>
            <MenuBarIconButton
                disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                tooltipPlacement={"bottom-start"}
                tooltipTitle={"Search by timestamp"}
                onClick={() => {
                    const input = document.getElementById(
                        "timestamp-query-box-input"
                    ) as HTMLInputElement;

                    searchByDateTime(input.value);
                }}
            >
                <SearchIcon/>
            </MenuBarIconButton>
        </Box>
    );
};

export default TimestampQueryBox;
