import {
    useCallback,
    useState,
} from "react";

import {
    Box,
    Divider,
} from "@mui/joy";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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
            {false === showTimestampQuery && (
                <>
                    <Divider orientation={"vertical"}/>
                    <MenuBarIconButton
                        disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                        tooltipTitle={"Search by timestamp"}
                        onClick={toggleTimestampQuery}
                    >
                        <CalendarTodayIcon/>
                    </MenuBarIconButton>
                    <Divider orientation={"vertical"}/>
                </>
            )}
            <div
                className={`timestamp-query-input-wrapper ${showTimestampQuery ?
                    "expanded" :
                    ""}`}
            >
                <TimestampQueryInput setShowTimestampQuery={setShowTimestampQuery}/>
            </div>
        </Box>
    );
};

export default TimestampQueryContainer;
