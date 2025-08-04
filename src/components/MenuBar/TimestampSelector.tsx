import {Box} from "@mui/joy";

import SearchIcon from "@mui/icons-material/Search";

import useUiStore from "../../stores/uiStore";
import {UI_ELEMENT} from "../../typings/states";
import {isDisabled} from "../../utils/states";
import {updateWindowUrlHashParams} from "../../utils/url";
import {updateViewHashParams} from "../../utils/url/urlHash";
import MenuBarIconButton from "./MenuBarIconButton";


/**
 * renders a timestamp input field and a search icon button.
 * Users can input a date and time in UTC format and either press "Enter"
 * or click the search button to update the application's state and URL hash parameters.
 *
 * @return
 */
const TimestampSelector = () => {
    const uiState = useUiStore((state) => state.uiState);
    return (
        <Box
            alignItems={"center"}
            className={"menu-bar-datetime-container"}
            display={"flex"}
            flexDirection={"row"}
        >
            <input
                className={"menu-bar-datetime-input"}
                disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                id={"menu-bar-datetime-input"}
                step={"0.1"}
                title={"Input date and time in UTC"}
                type={"datetime-local"}
                onKeyDown={(e) => {
                    if ("Enter" === e.key) {
                        const datetime = e.currentTarget.value;
                        if (datetime) {
                            const timestamp = new Date(`${datetime}Z`).getTime();
                            updateWindowUrlHashParams({timestamp: timestamp});
                            updateViewHashParams();
                        }
                    }
                }}/>
            <MenuBarIconButton
                disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                size={"sm"}
                tooltipPlacement={"bottom-start"}
                tooltipTitle={"Search by timestamp"}
                onClick={() => {
                    const input = document.getElementById(
                        "menu-bar-datetime-input"
                    ) as HTMLInputElement;
                    const datetime = input.value;
                    if (datetime) {
                        const timestamp = new Date(`${datetime}Z`).getTime();
                        updateWindowUrlHashParams({timestamp: timestamp});
                        updateViewHashParams();
                    }
                }}
            >
                <SearchIcon/>
            </MenuBarIconButton>
        </Box>
    );
};

export default TimestampSelector;
