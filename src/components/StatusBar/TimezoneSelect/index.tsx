import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {SelectValue} from "@mui/base/useSelect";
import {Autocomplete} from "@mui/joy";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import useUiStore from "../../../stores/uiStore";
import useViewStore from "../../../stores/viewStore";
import {
    BROWSER_TIMEZONE_NAME,
    DEFAULT_TIMEZONE_NAME,
    getTimezoneCategory,
    INTL_SUPPORTED_TIMEZONE_NAMES,
    LOGGER_TIMEZONE_NAME,
    UTC_TIMEZONE_OFFSET_NAMES,
} from "../../../typings/date";
import {UI_ELEMENT} from "../../../typings/states";
import {HASH_PARAM_NAMES} from "../../../typings/url";
import {isDisabled} from "../../../utils/states";
import {updateWindowUrlHashParams} from "../../../utils/url";
import TimezoneCategoryChip from "./TimezoneCategoryChip.tsx";

import "./index.css";


/**
 * The timezone select dropdown menu, the selectable options can be classified as three types:
 * - Default (use the origin timezone of the log events)
 * - Browser Timezone (use the timezone that the browser is currently using)
 * - Frequently-used Timezone
 *
 * @return A timezone select dropdown menu
 */
const TimezoneSelect = () => {
    const uiState = useUiStore((state) => state.uiState);
    const timezoneName = useViewStore((state) => state.timezoneName);

    const [inputWidth, setInputWidth] = useState<string>(`${timezoneName.length}ch`);
    const timezoneNameOptions = useMemo(() => [
        DEFAULT_TIMEZONE_NAME,
        BROWSER_TIMEZONE_NAME,
        LOGGER_TIMEZONE_NAME,
        ...UTC_TIMEZONE_OFFSET_NAMES,
        ...INTL_SUPPORTED_TIMEZONE_NAMES.filter(
            (tzName) => tzName !== BROWSER_TIMEZONE_NAME
        ),
    ], []);

    const handleTimezoneSelectChange =
        useCallback((_: unknown, value: SelectValue<string, false>) => {
            if (null === value) {
                throw new Error("Unexpected null value in non-clearable timezone select.");
            }

            const {updateTimezoneName} = useViewStore.getState();
            updateTimezoneName(value);
            updateWindowUrlHashParams({
                [HASH_PARAM_NAMES.TIMEZONE]: value,
            });
        }, []);

    useEffect(() => {
        // Update the input width based on the selected timezone name.
        setInputWidth(`${timezoneName.length}ch`);
    }, [timezoneName]);


    const disabled = isDisabled(uiState, UI_ELEMENT.TIMEZONE_SETTER);

    return (
        <Autocomplete
            className={"timezone-select"}
            componentName={"button"}
            disableClearable={true}
            disabled={disabled}
            groupBy={getTimezoneCategory}
            openOnFocus={true}
            options={timezoneNameOptions}
            popupIcon={<KeyboardArrowUpIcon/>}
            size={"sm"}
            value={timezoneName}
            variant={"soft"}
            slotProps={{
                popupIndicator: {
                    className: "timezone-select-pop-up-indicator",
                },
                input: {
                    sx: {
                        width: inputWidth,
                    },
                },
                listbox: {
                    className: "timezone-select-listbox",
                    placement: "top-end",
                    modifiers: [
                        // Remove gap between the listbox and the `Select` button.
                        {name: "offset", enabled: false},
                    ],
                },
            }}
            startDecorator={<TimezoneCategoryChip
                category={getTimezoneCategory(timezoneName)}
                disabled={disabled}/>}
            onChange={handleTimezoneSelectChange}/>
    );
};


export default TimezoneSelect;
