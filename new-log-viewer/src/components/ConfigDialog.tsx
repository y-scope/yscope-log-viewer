import FormControl from "@mui/joy/FormControl/FormControl";
import FormLabel from "@mui/joy/FormLabel/FormLabel";
import Input from "@mui/joy/Input";

import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../typings/config";
import {getConfig} from "../utils/config";


const formFields = [
    // FIXME: add helper text for each field.
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).formatString,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).logLevelKey,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).timestampKey,
        label: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
        type: "text",
    },
    {
        initialValue: getConfig(CONFIG_KEY.PAGE_SIZE),
        label: LOCAL_STORAGE_KEY.PAGE_SIZE,
        name: LOCAL_STORAGE_KEY.PAGE_SIZE,
        type: "number",
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
