import React, {
    useCallback,
    useState,
} from "react";

import {SelectValue} from "@mui/base/useSelect";
import {
    Box,
    Checkbox,
    Chip,
    IconButton,
    ListItemContent,
    ListItemDecorator,
    MenuItem,
    Option,
    Select,
    SelectOption,
    Tooltip,
    TooltipProps,
} from "@mui/joy";

import CloseIcon from "@mui/icons-material/Close";
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
 * Renders a `<Tooltip/>` with its placement set to the left of the target element.
 *
 * @param props
 * @return
 */
const PlacementLeftTooltip = (props: TooltipProps) => (
    <Tooltip
        {...props}
        placement={"left"}
    >
        {props.children}
    </Tooltip>
);

/**
 * Renders a `<Tooltip/>` with its placement set to the right of the target element.
 *
 * @param props
 * @return
 */
const PlacementRightTooltip = (props: TooltipProps) => (
    <Tooltip
        {...props}
        placement={"right"}
    >
        {props.children}
    </Tooltip>
);

/**
 * Renders a dropdown box for selecting log levels.
 *
 * @return
 */
const LogLevelSelect = () => {
    const [selectedLogLevels, setSelectedLogLevels] = useState<LOG_LEVEL[]>([]);

    const handleRenderValue = (selected: SelectValue<SelectOption<LOG_LEVEL>, true>) => (
        <Box className={"log-level-select-render-value-box"}>
            <Chip className={"log-level-select-render-value-box-label"}>
                Log Level
            </Chip>
            {selected.map((selectedOption) => (
                <LogLevelChip
                    key={selectedOption.value}
                    name={selectedOption.label as string}
                    value={selectedOption.value}/>
            ))}
        </Box>
    );

    const handleCheckboxClick = useCallback((ev: React.MouseEvent<HTMLInputElement>) => {
        ev.preventDefault();

        const target = ev.target as HTMLInputElement;
        const value = Number(target.value) as LOG_LEVEL;
        let newSelectedLogLevels: LOG_LEVEL[];
        if (selectedLogLevels.includes(value)) {
            newSelectedLogLevels = selectedLogLevels.filter((logLevel) => logLevel !== value);
        } else {
            newSelectedLogLevels = [
                ...selectedLogLevels,
                value,
            ];
        }
        setSelectedLogLevels(newSelectedLogLevels.sort((a, b) => a - b));
    }, [selectedLogLevels]);

    const handleSelectChange = useCallback((
        ev: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null
    ) => {
        if (null === ev) {
            setSelectedLogLevels([]);

            return;
        }

        const target = ev.target as HTMLElement;
        const selectedValue = Number(target.dataset.value);
        setSelectedLogLevels(range(selectedValue, 1 + MAX_LOG_LEVEL));
    }, []);

    const handleSelectClearButtonClick = () => {
        handleSelectChange(null);
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
                <Tooltip title={"Clear filters"}>
                    <IconButton
                        variant={"plain"}
                        onClick={handleSelectClearButtonClick}
                        onMouseDown={handleSelectClearButtonMouseDown}
                    >
                        <CloseIcon/>
                    </IconButton>
                </Tooltip>}
            slotProps={{listbox: {
                className: "log-level-select-listbox",
                placement: "top-end",
            }}}
            onChange={handleSelectChange}
        >
            {/* Add a dummy MenuItem to avoid the first Option receiving focus. */}
            <MenuItem className={"log-level-select-dummy-option"}/>
            {LOG_LEVEL_NAMES.toReversed().map((logLevelName, index) => {
                const logLevelValue = LOG_LEVEL_NAMES.length - 1 - index;
                const checked = selectedLogLevels.includes(logLevelValue);
                return (
                    <Option
                        data-value={logLevelValue}
                        key={logLevelName}
                        value={logLevelValue}
                    >
                        <ListItemDecorator>
                            <PlacementLeftTooltip
                                title={`${checked ?
                                    "-" :
                                    "+"} ${logLevelName}`}
                            >
                                <Checkbox
                                    checked={checked}
                                    size={"sm"}
                                    value={logLevelValue}
                                    onClick={handleCheckboxClick}/>
                            </PlacementLeftTooltip>
                        </ListItemDecorator>
                        <PlacementRightTooltip title={`^ ${logLevelName}`}>
                            <ListItemContent data-value={logLevelValue}>
                                {logLevelName}
                            </ListItemContent>
                        </PlacementRightTooltip>
                    </Option>
                );
            })}
            <PlacementRightTooltip title={"Clear filters"}>
                <Option
                    value={-1}
                    onClick={handleSelectClearButtonClick}
                >
                    <ListItemDecorator/>
                    ALL
                </Option>
            </PlacementRightTooltip>
        </Select>
    );
};
export default LogLevelSelect;
