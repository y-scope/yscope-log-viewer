import FormControl from "@mui/joy/FormControl/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel/FormLabel";
import Input from "@mui/joy/Input";

import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../typings/config";
import {getConfig} from "../utils/config";


const formFields = [
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).formatString,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
        type: "text",
        helperText: "The format string used to decode the log messages.",
    },
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).logLevelKey,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
        type: "text",
        helperText: "The key used to determine the log level.",
    },
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).timestampKey,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
        type: "text",
        helperText: "The key used to determine the timestamp.",
    },
    {
        initialValue: getConfig(CONFIG_KEY.PAGE_SIZE),
        label: LOCAL_STORAGE_KEY.PAGE_SIZE,
        name: LOCAL_STORAGE_KEY.PAGE_SIZE,
        type: "number",
        helperText: "The number of log messages to display per page.",
    },
];

/**
 * Renders a configuration settings form.
 *
 * @return
 */
const ConfigDialog = () => {
    return (
        <>
            {formFields.map((field, index) => (
                <FormControl
                    className={"config-form-control"}
                    key={index}
                    orientation={"vertical"}
                >
                    <FormLabel>
                        {field.label}
                    </FormLabel>
                    <FormHelperText>
                        {field.helperText}
                    </FormHelperText>
                    <Input
                        slotProps={{
                            input: {
                                defaultValue: field.initialValue,
                                name: field.name,
                                size: 100,
                                type: field.type,
                            },
                        }}/>

                </FormControl>
            ))}
        </>
    );
};

export default ConfigDialog;
