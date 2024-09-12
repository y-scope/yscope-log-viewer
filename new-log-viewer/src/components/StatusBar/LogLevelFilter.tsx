import React, {
    useContext,
    useState
} from "react";

import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    LOG_LEVEL,
    LOG_LEVEL_NAMES_LIST,
    LOG_LEVEL_VALUES_LIST
} from "../../typings/logs";


export default function LogLevelFilter () {
    const [selectedLogLevels, setSelectedLogLevels] = useState<LOG_LEVEL[]>([
        ...LOG_LEVEL_VALUES_LIST,
    ]);

    const {changeLogLevelFilter} = useContext(StateContext);

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
        console.log(`You have chosen "${newValue}"`);
    };

    return (
        <Select

            // Convert selected log levels to strings for value.
            multiple
            value={selectedLogLevels.map(String)}
            slotProps={{
                listbox: {
                    sx: {
                        width: "100%",
                    },
                },
            }}
            sx={{minWidth: "13rem"}}
            onChange={handleChange}
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
