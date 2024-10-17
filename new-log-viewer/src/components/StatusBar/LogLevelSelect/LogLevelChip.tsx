import {
    Chip,
    Tooltip,
} from "@mui/joy";
import type {DefaultColorPalette} from "@mui/joy/styles/types";

import {LOG_LEVEL} from "../../../typings/logs";

import "./LogLevelChip.css";


/**
 * Maps log levels to colors from JoyUI's default color palette.
 */
const LOG_LEVEL_COLOR_MAP: Record<LOG_LEVEL, DefaultColorPalette> = Object.freeze({
    [LOG_LEVEL.UNKNOWN]: "neutral",
    [LOG_LEVEL.TRACE]: "success",
    [LOG_LEVEL.DEBUG]: "success",
    [LOG_LEVEL.INFO]: "primary",
    [LOG_LEVEL.WARN]: "warning",
    [LOG_LEVEL.ERROR]: "danger",
    [LOG_LEVEL.FATAL]: "danger",
});

interface LogLevelChipProps {
    name: string,
    value: LOG_LEVEL,
}

/**
 * Renders a log level chip.
 *
 * @param props
 * @param props.name
 * @param props.value
 * @return
 */
const LogLevelChip = ({name, value}: LogLevelChipProps) => (
    <Tooltip
        key={value}
        title={name}
    >
        <Chip
            className={"log-level-chip"}
            color={LOG_LEVEL_COLOR_MAP[value]}
            variant={"outlined"}
        >
            {name[0]}
        </Chip>
    </Tooltip>
);


export default LogLevelChip;
