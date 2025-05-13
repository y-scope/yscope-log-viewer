import React from "react";

import {
    AccordionGroup,
    Box,
    Link,
} from "@mui/joy";

import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../../../../../typings/config";
import {getConfig} from "../../../../../utils/config";
import {SettingsFormFieldProps} from "./SettingsFormField";
import SettingsFormFieldsSection from "./SettingsFormFieldsSection";
import ThemeSwitchFormField from "./ThemeSwitchFormField";

import "./SettingsFormFieldSectionsGroup.css";


type SettingsFormFields = SettingsFormFieldProps | React.ReactNode;

/**
 * Gets form fields information for user input of configuration values.
 *
 * @return A list of form fields information or React nodes.
 */
const getConfigFormFieldSections = (): Array<{
    name: string;
    fields: SettingsFormFields[];
}> => [
    {
        name: "Common",
        fields: [
            <ThemeSwitchFormField key={"settings-theme-switch"}/>,
            {
                configKey: LOCAL_STORAGE_KEY.PAGE_SIZE,
                helperText: "Number of log messages to display per page.",
                initialValue: getConfig(CONFIG_KEY.PAGE_SIZE),
                label: "View: Page size",
                type: "number",
            },
        ],
    },
    {
        name: "KV-Pairs IR / JSON",
        fields: [
            {
                configKey: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
                helperText: (
                    <span>
                        Format string for formatting a JSON log event as plain text. See the
                        {" "}
                        <Link
                            href={"https://docs.yscope.com/yscope-log-viewer/main/user-guide/format-struct-logs-overview.html"}
                            level={"body-sm"}
                            rel={"noopener"}
                            target={"_blank"}
                        >
                            format string syntax docs
                        </Link>
                        {" "}
                        or leave this blank to display the entire log event.
                    </span>
                ),
                initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).formatString,
                label: "Decoder: Format string",
                type: "text",
            },
            {
                configKey: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
                helperText: "Key to extract the log level from.",
                initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).logLevelKey,
                label: "Decoder: Log level key",
                type: "text",
            },
            {
                configKey: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
                helperText: "Key to extract the log timestamp from.",
                initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).timestampKey,
                label: "Decoder: Timestamp key",
                type: "text",
            },
        ],
    },
];

/**
 * Displays a group of form fields for user input of configuration values.
 *
 * @return
 */
const SettingsFormFieldSectionsGroup = () => (
    <Box className={"settings-form-field-sections-group-container"}>
        <AccordionGroup
            className={"settings-form-field-sections-group"}
            size={"sm"}
        >
            {getConfigFormFieldSections().map(
                ({name, fields}, i) => (
                    <SettingsFormFieldsSection
                        fields={fields}
                        key={i}
                        name={name}/>
                )
            )}
        </AccordionGroup>
    </Box>
);

export type {SettingsFormFields};
export default SettingsFormFieldSectionsGroup;
