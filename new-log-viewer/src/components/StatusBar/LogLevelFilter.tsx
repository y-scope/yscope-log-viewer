import React, {
    useContext,
    useRef,
    useState,
} from "react";

import IconButton from "@mui/joy/IconButton";
import Option from "@mui/joy/Option";
import Select, {SelectStaticProps} from "@mui/joy/Select";

import CloseRounded from "@mui/icons-material/CloseRounded";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    LOG_LEVEL_NAMES,
    LogLevelFilter,
} from "../../typings/logs";


/**
 * Renders log level filter
 *
 * @return
 */
const LogLevelSelect = () => {
    const [selectedLogLevels, setSelectedLogLevels] =
    useState<LogLevelFilter>(null);
    const {setLogLevelFilter} = useContext(StateContext);
    const action: SelectStaticProps["action"] = useRef(null);

    /**
     * Handles changes in the selection of log levels.
     *
     * @param event
     * @param newValue An array of new filter values.
     */
    const handleChange = (
        event: React.SyntheticEvent | null,
        newValue: Array<string> | null
    ) => {
        let selected: LogLevelFilter;
        if (newValue && 0 < newValue.length) {
            // convert strings to number
            selected = newValue.map((value) => Number(value));
        } else {
            selected = null;
        }
        setSelectedLogLevels(selected);
        setLogLevelFilter(selected);
    };

    return (
        <Select
            action={action}
            multiple={true}
            placeholder={"Filter Verbosity"}
            size={"sm"}

            // Convert selected log levels to strings for value.
            value={selectedLogLevels?.map(String) || []}

            // It would be nice for variant=solid; however, JoyUI appears to have a bug
            // where selected values are not highlighted with variant=solid. There may be
            // workarounds for this, but left as variant=plain for now.
            variant={"plain"}
            slotProps={{
                listbox: {
                    sx: {
                        width: "100%",
                    },
                },
            }}
            sx={{
                borderRadius: 0,
                minWidth: "8rem",
            }}

            // The following code is responsible for the clear action "x" on
            // select element.
            {...(selectedLogLevels && {
                // Display the button and remove select indicator
                // when user has selected a value.
                endDecorator: (
                    <IconButton
                        sx={{color: "white"}}
                        variant={"plain"}
                        onClick={() => {
                            // Reset log levels to null.
                            handleChange(null, null);
                            action.current?.focusVisible();
                        }}
                        onMouseDown={(event) => {
                            // Don't open the popup when clicking on this button
                            event.stopPropagation();
                        }}
                    >
                        <CloseRounded/>
                    </IconButton>
                ),
                indicator: null,
            })}
            onChange={handleChange}
        >
            {LOG_LEVEL_NAMES
                .map((logLevelName, index) => (
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

export default LogLevelSelect;
