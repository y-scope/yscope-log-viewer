import React from "react";

import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl/FormControl";
import FormLabel from "@mui/joy/FormLabel/FormLabel";
import Input from "@mui/joy/Input";

import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../typings/config";
import {
    getConfig,
    setConfig,
} from "../utils/config";


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
const ConfigForm = () => {
    const handleConfigFormReset = (ev: React.FormEvent) => {
        ev.preventDefault();
        window.localStorage.clear();
        window.location.reload();
    };

    const handleConfigFormSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);

        const formatString = formData.get(LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING);
        const logLevelKey = formData.get(LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY);
        const timestampKey = formData.get(LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY);
        const pageSize = formData.get(LOCAL_STORAGE_KEY.PAGE_SIZE);
        let error = null;
        if (
            "string" === typeof formatString &&
            "string" === typeof logLevelKey &&
            "string" === typeof timestampKey
        ) {
            error ||= setConfig({
                key: CONFIG_KEY.DECODER_OPTIONS,
                value: {formatString, logLevelKey, timestampKey},
            });
        }
        if ("string" === typeof pageSize) {
            error ||= setConfig({
                key: CONFIG_KEY.PAGE_SIZE,
                value: Number(pageSize),
            });
        }
        if (null !== error) {
            // eslint-disable-next-line no-warning-comments
            // TODO: Show an error pop-up once NotificationProvider is implemented.
            // eslint-disable-next-line no-alert
            window.alert(error);
        } else {
            window.location.reload();
        }
    };

    return (
        <form
            onReset={handleConfigFormReset}
            onSubmit={handleConfigFormSubmit}
        >
            {formFields.map((field, index) => (

                // FIXME: Styling needs to be extracted to a CSS file.
                <FormControl
                    key={index}
                    orientation={"horizontal"}
                    style={{
                        display: "flex",
                        flexGrow: 1,
                        marginBottom: "16px",
                        width: "100%",
                    }}
                >
                    <FormLabel>
                        {field.label}
                    </FormLabel>
                    <Input

                        // FIXME:pageSize doesn't extend to the right edge, even with flexGrow: 1.
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
            <div>
                <Button
                    color={"primary"}
                    type={"submit"}
                >
                    Apply & Reload
                </Button>
                <Button
                    color={"neutral"}
                    type={"reset"}
                >
                    Reset Default
                </Button>
            </div>
        </form>
    );
};

export default ConfigForm;
