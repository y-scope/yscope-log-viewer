import React, {useContext, useState} from "react";

import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    LOG_LEVEL,
    LOG_LEVEL_NAMES_LIST,
    LOG_LEVEL_VALUES_LIST
} from "../../typings/logs";

export default function LogLevelFilter () {
    const [selectedLogLevels, setSelectedLogLevels] =
    useState<LOG_LEVEL[]>([...LOG_LEVEL_VALUES_LIST]);

    const {
        changeLogLevelFilter,
    } = useContext(StateContext);

    const handleChange = (
        event: React.SyntheticEvent | null,
        newValue: Array<string> | null
    ) => {
        const selectedLogLevels: LOG_LEVEL[] = newValue
            ? newValue.map((value) => Number(value)) // Convert strings to numbers
            : [];

        setSelectedLogLevels(selectedLogLevels);
        changeLogLevelFilter(selectedLogLevels);
        console.log(`You have chosen "${newValue}"`);
    };

    return (
        <Select
        // Convert selected log levels to strings for value
            value={selectedLogLevels.map(String)}
            multiple
            onChange={handleChange}
            sx={{minWidth: "13rem"}}
            slotProps={{
                listbox: {
                    sx: {
                        width: "100%",
                    },
                },
            }}
        >
            {LOG_LEVEL_NAMES_LIST.map((logLevelName, index) => (
                <Option
                    key={logLevelName}
                    value={index.toString()} // Use index as value
                >
                    {logLevelName}
                </Option>
            ))}
        </Select>
    );
}
