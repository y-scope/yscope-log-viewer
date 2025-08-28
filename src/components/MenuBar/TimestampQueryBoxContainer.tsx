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
import TimestampQueryBox from "./TimestampQueryBox";

import "./TimestampQueryBoxContainer.css";


/**
 * Wraps TimestampQueryBox with a toggle button.
 * It includes a toggle button to show or hide the Timestamp Query Box and manages its state.
 *
 * @return The rendered component.
 */
const TimestampQueryBoxContainer = () => {
    const [showTimestampQuery, setShowTimestampQuery] = useState(false);
    const uiState = useUiStore((state) => state.uiState);

    const toggleTimestampQuery = useCallback(() => {
        setShowTimestampQuery((prev) => !prev);
    }, []);

    return (
        <Box className={"timestamp-query-box-container"}>
            <MenuBarIconButton
                disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                tooltipTitle={showTimestampQuery ?
                    "Collapse" :
                    "Seek to timestamp"}
                onClick={toggleTimestampQuery}
            >
                {showTimestampQuery ?
                    <CollapseIcon/> :
                    <CalendarTodayIcon/>}
            </MenuBarIconButton>

            <div
                className={`timestamp-query-wrapper ${showTimestampQuery ?
                    "expanded" :
                    ""}`}
            >
                <TimestampQueryBox/>
            </div>
        </Box>
    );
};

export default TimestampQueryBoxContainer;
