import React, {
    useCallback,
    useContext,
    useEffect,
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
    Option,
    Select,
    SelectOption,
    Stack,
    Tooltip,
} from "@mui/joy";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RemoveIcon from "@mui/icons-material/Remove";

import {StateContext} from "../../../contexts/StateContextProvider";
import {
    INVALID_LOG_LEVEL_VALUE,
    LOG_LEVEL,
    LOG_LEVEL_NAMES,
    MAX_LOG_LEVEL,
} from "../../../typings/logs";
import {UI_ELEMENT} from "../../../typings/states";
import {range} from "../../../utils/data";
import {
    ignorePointerIfFastLoading,
    isDisabled,
} from "../../../utils/states";
import LogLevelChip from "./LogLevelChip";

import "./index.css";


interface LogSelectOptionProps {
    isChecked: boolean,
    logLevelName: string,
    logLevelValue: LOG_LEVEL,
    onCheckboxClick: React.MouseEventHandler
    onOptionClick: React.MouseEventHandler
}

/**
 * Renders an <Option/> in the <LogLevelSelect/> for selecting some log level and/or the levels
 * above it.
 *
 * @param props
 * @param props.isChecked
 * @param props.logLevelName
 * @param props.logLevelValue
 * @param props.onCheckboxClick
 * @param props.onOptionClick
 * @return
 */
const LogSelectOption = ({
    isChecked,
    logLevelName,
    logLevelValue,
    onCheckboxClick,
    onOptionClick,
}: LogSelectOptionProps) => {
    return (
        <Option
            data-value={logLevelValue}
            key={logLevelName}
            value={logLevelValue}
            onClick={onOptionClick}
        >
            <ListItemDecorator>
                <Tooltip
                    placement={"left"}
                    title={
                        <Stack
                            alignItems={"center"}
                            direction={"row"}
                        >
                            {isChecked ?
                                <RemoveIcon/> :
                                <AddIcon/>}
                            {logLevelName}
                        </Stack>
                    }
                >
                    <Checkbox
                        checked={isChecked}
                        size={"sm"}
                        value={logLevelValue}
                        onClick={onCheckboxClick}/>
                </Tooltip>
            </ListItemDecorator>
            <Tooltip
                placement={"left"}
                slotProps={{root: {className: "log-level-select-option-text-tooltip"}}}
                title={
                    <Stack
                        alignItems={"center"}
                        direction={"row"}
                    >
                        {logLevelName}
                        {" and below"}
                    </Stack>
                }
            >
                <ListItemContent>
                    {logLevelName}
                </ListItemContent>
            </Tooltip>
        </Option>
    );
};

interface ClearFiltersOptionProps {
    onClick: () => void
}

/**
 * Renders an <Option/> to clear all filters in the <LogLevelSelect/>.
 *
 * @param props
 * @param props.onClick
 * @return
 */
const ClearFiltersOption = ({onClick}: ClearFiltersOptionProps) => {
    return (
        <Option
            value={INVALID_LOG_LEVEL_VALUE}
            onClick={onClick}
        >
            <ListItemDecorator>
                <CloseIcon/>
            </ListItemDecorator>
            Clear filters
        </Option>
    );
};

/**
 * Renders a dropdown box for selecting log levels.
 *
 * @return
 */
const LogLevelSelect = () => {
    const {uiState, setLogLevelFilter} = useContext(StateContext);
    const [selectedLogLevels, setSelectedLogLevels] = useState<LOG_LEVEL[]>([]);
    const disabled = isDisabled(uiState, UI_ELEMENT.LOG_LEVEL_FILTER);

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
        ev.stopPropagation();

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

    const handleOptionClick = useCallback((ev: React.MouseEvent) => {
        const currentTarget = ev.currentTarget as HTMLElement;
        if ("undefined" === typeof currentTarget.dataset.value) {
            console.error("Unexpected undefined value for \"data-value\" attribute");

            return;
        }

        const selectedValue = Number(currentTarget.dataset.value);
        setSelectedLogLevels(range({begin: selectedValue, end: 1 + MAX_LOG_LEVEL}));
    }, []);

    const handleSelectClearButtonClick = () => {
        setSelectedLogLevels([]);
    };

    useEffect(() => {
        setLogLevelFilter((0 === selectedLogLevels.length ?
            null :
            selectedLogLevels));
    }, [
        setLogLevelFilter,
        selectedLogLevels,
    ]);

    return (
        <Select
            className={`log-level-select ${ignorePointerIfFastLoading(uiState)}`}
            disabled={disabled}
            multiple={true}
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
                    >
                        <CloseIcon/>
                    </IconButton>
                </Tooltip>}
            placeholder={
                <Chip
                    className={`log-level-select-render-value-box-label ${disabled ?
                        "log-level-select-render-value-box-label-disabled" :
                        ""}`}
                >
                    Log Level
                </Chip>
            }
            slotProps={{
                listbox: {
                    className: "log-level-select-listbox",
                    placement: "top-end",
                },
            }}
        >
            <ClearFiltersOption onClick={handleSelectClearButtonClick}/>
            {LOG_LEVEL_NAMES.map((logLevelName, logLevelValue) => {
                const checked = selectedLogLevels.includes(logLevelValue);
                return (
                    <LogSelectOption
                        isChecked={checked}
                        key={logLevelName}
                        logLevelName={logLevelName}
                        logLevelValue={logLevelValue}
                        onCheckboxClick={handleCheckboxClick}
                        onOptionClick={handleOptionClick}/>
                );
            })}
        </Select>
    );
};
export default LogLevelSelect;
