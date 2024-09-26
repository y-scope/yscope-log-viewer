import React, {
    useCallback,
    useState,
} from "react";

import {SelectValue} from "@mui/base/useSelect";
import {
    Box,
    Chip,
    IconButton,
    MenuItem,
    Option,
    Select,
    SelectOption,
} from "@mui/joy";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
    LOG_LEVEL,
    LOG_LEVEL_NAMES,
    MAX_LOG_LEVEL,
} from "../../../typings/logs";
import {range} from "../../../utils/data";
import LogLevelChip from "./LogLevelChip";

import "./index.css";


/**
 * Renders a dropdown box for selecting log levels.
 *
 * @return
 */
const LogLevelSelect = () => {
    const [selectedLogLevels, setSelectedLogLevels] = useState<LOG_LEVEL[]>([]);

    const handleRenderValue = (selected: SelectValue<SelectOption<LOG_LEVEL>, true>) => (
        <Box className={"log-level-select-render-value-box"}>
            <Chip
                className={"log-level-select-render-value-box-label"}
                variant={"soft"}
            >
                Log Level
            </Chip>
            {selected.map((selectedOption) => (
                <LogLevelChip
                    key={selectedOption.value}
                    name={selectedOption.label as string}
                    value={selectedOption.value}
                    onSelectedLogLevelsChange={setSelectedLogLevels}/>
            ))}
        </Box>
    );

    const handleSelectChange = useCallback((
        _: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null,
        newValue: SelectValue<LOG_LEVEL, true>
    ) => {
        if (0 === selectedLogLevels.length) {
            const [singleSelectValue] = newValue;
            setSelectedLogLevels(range(singleSelectValue as number, 1 + MAX_LOG_LEVEL));
        } else {
            setSelectedLogLevels(newValue.sort());
        }
    }, [selectedLogLevels]);

    const handleSelectClearButtonClick = () => {
        handleSelectChange(null, []);
    };

    const handleSelectClearButtonMouseDown = (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation();
    };

    return (
        <Select
            multiple={true}
            placeholder={"Log Level"}
            renderValue={handleRenderValue}
            size={"sm"}
            value={selectedLogLevels}
            variant={"soft"}
            indicator={0 === selectedLogLevels.length ?
                <KeyboardArrowUpIcon/> :
                <IconButton
                    variant={"plain"}
                    onClick={handleSelectClearButtonClick}
                    onMouseDown={handleSelectClearButtonMouseDown}
                >
                    <CloseRoundedIcon/>
                </IconButton>}
            onChange={handleSelectChange}
        >
            {/* Add a dummy MenuItem to avoid the first Option receiving focus. */}
            <MenuItem className={"log-level-select-dummy-option"}/>
            {LOG_LEVEL_NAMES.map((logLevelName, index) => (
                <Option
                    key={logLevelName}
                    value={index}
                >
                    {logLevelName}
                </Option>
            ))}
        </Select>
    );
};
export default LogLevelSelect;
