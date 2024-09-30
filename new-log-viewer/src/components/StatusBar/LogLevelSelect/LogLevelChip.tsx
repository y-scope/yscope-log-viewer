import React from "react";

import {
    Chip,
    Tooltip,
} from "@mui/joy";
import {DefaultColorPalette} from "@mui/joy/styles/types/colorSystem";

import {LOG_LEVEL} from "../../../typings/logs";

import "./LogLevelChip.css";


/**
 * Maps log levels with colors from JoyUI's default color palette.
 */
const LOG_LEVEL_COLOR_MAP: Record<LOG_LEVEL, DefaultColorPalette> = Object.freeze({
    [LOG_LEVEL.NONE]: "neutral",
    [LOG_LEVEL.TRACE]: "neutral",
    [LOG_LEVEL.DEBUG]: "neutral",
    [LOG_LEVEL.INFO]: "primary",
    [LOG_LEVEL.WARN]: "warning",
    [LOG_LEVEL.ERROR]: "danger",
    [LOG_LEVEL.FATAL]: "danger",
});

interface LogLevelChipProps {
    name: string,
    value: LOG_LEVEL,

    onSelectedLogLevelsChange: (setter: (value: LOG_LEVEL[]) => LOG_LEVEL[]) => void,
}

/**
 * Renders a log level chip.
 *
 * @param props
 * @param props.name
 * @param props.value
 * @param props.onSelectedLogLevelsChange Callback to handle changes to selected log levels.
 * @return
 */
const LogLevelChip = ({name, value, onSelectedLogLevelsChange}: LogLevelChipProps) => {
    const handleChipClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation();
        onSelectedLogLevelsChange((oldValue) => oldValue.filter((v) => v !== value));
    };

    return (
        <Tooltip
            key={value}
            title={`${name} (Click to deselect)`}
        >
            <Chip
                className={"log-level-chip"}
                color={LOG_LEVEL_COLOR_MAP[value]}
                variant={"outlined"}
                onClick={handleChipClick}
            >
                {name[0]}
            </Chip>
        </Tooltip>
    );
};
export default LogLevelChip;
