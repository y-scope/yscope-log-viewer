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
 * Wraps the timestamp query input and toggles its visibility using a calendar button.
 *
 * @return
 */
const TimestampQueryContainer = () => {
    const [isInputVisible, setIsInputVisible] = useState(false);
    const uiState = useUiStore((state) => state.uiState);

    const handleInputVisibilityToggle = useCallback(() => {
        setIsInputVisible((prev) => !prev);
    }, []);

    return (
        <Box className={"timestamp-query-container"}>
            {false === isInputVisible && (
                <>
                    <Divider orientation={"vertical"}/>
                    <MenuBarIconButton
                        disabled={isDisabled(uiState, UI_ELEMENT.NAVIGATION_BAR)}
                        tooltipTitle={"Search by timestamp"}
                        onClick={handleInputVisibilityToggle}
                    >
                        <CalendarTodayIcon/>
                    </MenuBarIconButton>
                    <Divider orientation={"vertical"}/>
                </>
            )}
            <div
                className={`timestamp-query-input-wrapper ${isInputVisible ?
                    "expanded" :
                    ""}`}
            >
                <TimestampQueryInput onInputCollapse={handleInputVisibilityToggle}/>
            </div>
        </Box>
    );
};

export default TimestampQueryContainer;
