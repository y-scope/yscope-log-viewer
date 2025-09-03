import {
    useCallback,
    useState,
} from "react";

import {Box} from "@mui/joy";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CollapseIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

import useUiStore from "../../stores/uiStore";
import {UI_ELEMENT} from "../../typings/states";
import {isDisabled} from "../../utils/states";
import MenuBarIconButton from "./MenuBarIconButton";
import TimestampQueryInput from "./TimestampQueryInput";

import "./TimestampQueryContainer.css";


/**
 * Wraps TimestampQueryInput with a toggle button, which shows or hides the TimestampQueryInput.
 *
 * @return
 */
const TimestampQueryContainer = () => {
    const [showTimestampQuery, setShowTimestampQuery] = useState(false);
    const uiState = useUiStore((state) => state.uiState);

    const toggleTimestampQuery = useCallback(() => {
        setShowTimestampQuery((prev) => !prev);
    }, []);

    return (
        <Box className={"timestamp-query-container"}>
            <MenuBarIconButton
                disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                tooltipTitle={showTimestampQuery ?
                    "Collapse" :
                    "Search by timestamp"}
                onClick={toggleTimestampQuery}
            >
                {showTimestampQuery ?
                    <CollapseIcon/> :
                    <CalendarTodayIcon/>}
            </MenuBarIconButton>

            <div
                className={`timestamp-query-input-wrapper ${showTimestampQuery ?
                    "expanded" :
                    ""}`}
            >
                <TimestampQueryInput/>
            </div>
        </Box>
    );
};

export default TimestampQueryContainer;
