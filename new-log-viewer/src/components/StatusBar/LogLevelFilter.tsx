import React, {
    useContext,
    useState,
} from "react";

import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    LOG_LEVEL,
    LOG_LEVEL_NAMES_LIST,
    LOG_LEVEL_VALUES_LIST,
} from "../../typings/logs";

/**
 * Renders log level filter
 *
 * @return
 */
const LogLevelFilter = () => {
    const [selectedLogLevels, setSelectedLogLevels] = useState<LOG_LEVEL[]>([
        ...LOG_LEVEL_VALUES_LIST,
    ]);

    const {changeLogLevelFilter} = useContext(StateContext);

    /**
     * Handles changes in the selection of log levels.
     *
     * @param event The synthetic event triggered by the selection change.
     * @param newValue An array of selected values
     */
    const handleChange = (
        event: React.SyntheticEvent | null,
        newValue: Array<string> | null
    ) => {
        // convert strings to numbers.
        const selected: LOG_LEVEL[] = newValue ?
            newValue.map((value) => Number(value)) :
            [];

        setSelectedLogLevels(selected);
        changeLogLevelFilter(selected);
    };

    return (
        <Select

            // Convert selected log levels to strings for value.
            multiple={true}
            sx={{minWidth: "13rem"}}
            value={selectedLogLevels.map(String)}
            slotProps={{
                listbox: {
                    sx: {
                        width: "100%",
                    },
                },
            }}
            onChange={handleChange}
        >
            {LOG_LEVEL_NAMES_LIST.map((logLevelName, index) => (
                <Option
                    key={logLevelName}

                    // Use index as value.
                    value={index.toString()}
                >
                    {logLevelName}
                </Option>
            ))}
        </Select>
    );
};

export default LogLevelFilter;
