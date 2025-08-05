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
const handleTimestampQuery = (datetime: string) => {
    if (datetime) {
        console.error(datetime);
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
                defaultValue={new Date().toISOString()
                    .slice(0, -1)}
                onKeyDown={(e) => {
                    if ("Enter" === e.key) {
                        handleTimestampQuery(e.currentTarget.value);
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

                    handleTimestampQuery(input.value);
                }}
            >
                <SearchIcon/>
            </MenuBarIconButton>
        </Box>
    );
};

export default TimestampQueryBox;
