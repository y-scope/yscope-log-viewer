import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {SelectValue} from "@mui/base/useSelect";
import {
    Box,
    Chip,
    ListDivider,
    ListItemContent,
    Option,
    Select,
    SelectOption,
} from "@mui/joy";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
    updateWindowUrlHashParams,
    UrlContext,
} from "../../../contexts/UrlContextProvider";
import useUiStore from "../../../stores/uiStore";
import {UI_ELEMENT} from "../../../typings/states";
import {HASH_PARAM_NAMES} from "../../../typings/url";
import {isDisabled} from "../../../utils/states";

import "./index.css";


const LOGGER_TIMEZONE = "Logger Timezone";
const COMMON_TIMEZONES = [
    "America/New_York",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Honolulu",
    "America/Los_Angeles",
    "America/Chicago",
    "America/Denver",
    "Asia/Kolkata",
    "Europe/Berlin",
    "Europe/Moscow",
    "Asia/Dubai",
    "Asia/Singapore",
    "Asia/Seoul",
    "Pacific/Auckland",
];

/**
 * Convert the timezone string to GMT +/- minutes
 *
 * @param tz
 * @return The GMT +/- minutes shown before the timezone string
 */
const getLongOffsetOfTimezone = (tz: string): string => {
    return new Intl.DateTimeFormat("default", {
        timeZone: tz,
        timeZoneName: "longOffset",
    }).formatToParts()
        .find((p) => "timeZoneName" === p.type)?.value ?? "Unknown timezone";
};

/**
 * Render the selected timezone option in the status bar
 *
 * @param selected
 * @return The selected timezone shown in the status bar
 */
const handleRenderValue = (selected: SelectValue<SelectOption<string>, false>) => (
    <Box className={"timezone-select-render-value-box"}>
        <Chip className={"timezone-select-render-value-box-label"}>Timezone</Chip>
        <Chip>
            {selected?.label}
        </Chip>
    </Box>
);

/**
 * Render the timezone options in the dropdown menu
 *
 * @param value
 * @param label
 * @param onClick
 * @param suffix
 * @return An option box in the dropdown menu
 */
const renderTimezoneOption = (
    value: string,
    label: string,
    onClick: React.MouseEventHandler,
    suffix?: string
) => (
    <Option
        data-value={value}
        key={value}
        value={value}
        onClick={onClick}
    >
        {LOGGER_TIMEZONE !== value &&
            <ListItemContent>
                (
                {getLongOffsetOfTimezone(value)}
                )
                {" "}
                {label}
                {" "}
                {suffix ?? ""}
            </ListItemContent>}

        {LOGGER_TIMEZONE === value &&
            <ListItemContent>
                {LOGGER_TIMEZONE}
            </ListItemContent>}
    </Option>
);

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
    const {logTimezone} = useContext(UrlContext);

    const [browserTimezone, setBrowserTimezone] = useState<string | null>(null);
    const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);

    const logTimezoneRef = useRef<string | null>(logTimezone);

    const disabled = isDisabled(uiState, UI_ELEMENT.TIMEZONE_SETTER);

    useEffect(() => {
        const tz = new Intl.DateTimeFormat().resolvedOptions().timeZone;
        setBrowserTimezone(tz);
    }, []);

    useEffect(() => {
        logTimezoneRef.current = logTimezone;
        if (!disabled) {
            setSelectedTimezone(logTimezone ?? LOGGER_TIMEZONE);
        }
    }, [disabled,
        logTimezone]);

    useEffect(() => {
        if (selectedTimezone !== logTimezoneRef.current) {
            const updatedTimezone = (LOGGER_TIMEZONE === selectedTimezone) ?
                null :
                selectedTimezone;

            updateWindowUrlHashParams({
                [HASH_PARAM_NAMES.LOG_TIMEZONE]: updatedTimezone,
            });
        }
    }, [selectedTimezone]);

    const handleOptionClick = useCallback((ev: React.MouseEvent) => {
        const currentTarget = ev.currentTarget as HTMLElement;
        const value = currentTarget.dataset.value ?? LOGGER_TIMEZONE;
        setSelectedTimezone(value);
    }, []);

    return (
        <Select
            className={"timezone-select"}
            disabled={disabled}
            indicator={<KeyboardArrowUpIcon/>}
            renderValue={handleRenderValue}
            size={"sm"}
            value={selectedTimezone}
            variant={"soft"}
            placeholder={
                <Box className={"timezone-select-render-value-box"}>
                    <Chip
                        className={`timezone-select-render-value-box-label ${disabled ?
                            "timezone-select-render-value-box-label-disabled" :
                            ""}`}
                    >
                        Timezone
                    </Chip>
                </Box>
            }
            slotProps={{
                listbox: {
                    className: "timezone-select-listbox",
                    placement: "top-end",
                    modifiers: [
                        {name: "equalWidth", enabled: false},
                        {name: "offset", enabled: false},
                    ],
                },
            }}
            onChange={(_, value) => {
                if (value) {
                    setSelectedTimezone(value);
                }
            }}
        >
            {renderTimezoneOption(LOGGER_TIMEZONE, LOGGER_TIMEZONE, handleOptionClick)}

            {browserTimezone &&
                renderTimezoneOption(
                    browserTimezone,
                    browserTimezone,
                    handleOptionClick,
                    "(Browser Timezone)"
                )}

            <ListDivider
                inset={"gutter"}
                role={"separator"}/>

            {COMMON_TIMEZONES.map(
                (label) => renderTimezoneOption(label, label, handleOptionClick)
            )}
        </Select>
    );
};

export default TimezoneSelect;
