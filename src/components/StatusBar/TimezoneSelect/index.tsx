import React, { useCallback, useContext, useEffect, useState } from "react";
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
import "./index.css";
import { SelectValue } from "@mui/base/useSelect";
import { StateContext } from "../../../contexts/StateContextProvider";
import { isDisabled } from "../../../utils/states";
import { UI_ELEMENT } from "../../../typings/states";

const LOGGER_TIMEZONE = "Logger";
const COMMON_TIMEZONES = [
    "America/New_York",
    "Europe/London",
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

const getLongOffsetOfTimezone = (tz: string): string => {
    return Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        timeZoneName: "longOffset",
    }).formatToParts().find(p => p.type === "timeZoneName")?.value ?? "Unknown timezone"
};

const TimezoneSelect = () => {
    const {uiState} = useContext(StateContext);

    const [browserTimezone, setBrowserTimezone] = useState<string | null>(null);
    const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);

    const disabled = isDisabled(uiState, UI_ELEMENT.TIMEZONE_SETTER);

    useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setBrowserTimezone(tz);
    }, []);

    useEffect(() => {
        if (!disabled) {
            setSelectedTimezone(LOGGER_TIMEZONE);
        }
    }, [disabled]);

    const handleRenderValue = (selected: SelectValue<SelectOption<string>, false>) => (
        <Box className="timezone-select-render-value-box">
            <Chip className="timezone-select-render-value-box-label">Timezone</Chip>
            <Chip>{selected?.label}</Chip>
        </Box>
    );

    const handleOptionClick = useCallback((ev: React.MouseEvent) => {
        const currentTarget = ev.currentTarget as HTMLElement;
        const value = currentTarget.dataset.value!;
        setSelectedTimezone(value);
    }, []);

    return (
        <Select
            className="timezone-select"
            disabled={disabled}
            value={selectedTimezone}
            onChange={(_, value) => {
                if (value) setSelectedTimezone(value);
            }}
            renderValue={handleRenderValue}
            size="sm"
            variant="soft"
            indicator={<KeyboardArrowUpIcon />}
            placeholder={
                <Box className="timezone-select-render-value-box">
                    <Chip className={`timezone-select-render-value-box-label ${disabled ?
                        "timezone-select-render-value-box-label-disabled" :
                        ""}`}>
                        Timezone
                    </Chip>
                </Box>
            }
            slotProps={{
                listbox: {
                    className: "timezone-select-listbox",
                    placement: "top-end",
                    modifiers: [
                        { name: "equalWidth", enabled: false },
                        { name: "offset", enabled: false },
                    ],
                },
            }}
        >
            <Option
                key={LOGGER_TIMEZONE}
                value={LOGGER_TIMEZONE}
                data-value={LOGGER_TIMEZONE}
                onClick={handleOptionClick}
            >
                <ListItemContent>{LOGGER_TIMEZONE}</ListItemContent>
            </Option>

            {browserTimezone && browserTimezone !== "UTC" && (
                <Option
                    key={browserTimezone}
                    value={browserTimezone}
                    data-value={browserTimezone}
                    onClick={handleOptionClick}
                >
                    <ListItemContent>
                        ({getLongOffsetOfTimezone(browserTimezone)}) {browserTimezone} (Browser Timezone)
                    </ListItemContent>
                </Option>
            )}
            
            <ListDivider role="separator" inset="gutter" />
            
            {COMMON_TIMEZONES.map((label) => (
                <Option
                    key={label}
                    value={label}
                    data-value={label}
                    onClick={handleOptionClick}
                >
                    <ListItemContent>
                        ({getLongOffsetOfTimezone(label)}) {label}
                    </ListItemContent>
                </Option>
            ))}
        </Select>
    );
};

export default TimezoneSelect;
