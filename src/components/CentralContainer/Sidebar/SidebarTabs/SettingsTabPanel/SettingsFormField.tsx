import React from "react";

import {
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Textarea,
} from "@mui/joy";


interface SettingsFormFieldProps {
    configKey: string;
    helperText: string | React.ReactNode;
    initialValue: string | number;
    label: string;
    type: string;
}

/**
 * Displays a form field for user input of configuration values.
 *
 * @param props
 * @param props.configKey
 * @param props.helperText
 * @param props.initialValue
 * @param props.label
 * @param props.type
 * @return
 */
const SettingsFormField = ({
    configKey,
    helperText,
    initialValue,
    label,
    type,
}: SettingsFormFieldProps) => (
    <FormControl>
        <FormLabel>
            {label}
        </FormLabel>
        {"number" === type ?
            <Input
                defaultValue={initialValue}
                name={configKey}
                type={"number"}/> :
            <Textarea
                defaultValue={initialValue}
                name={configKey}/>}
        <FormHelperText>
            {helperText}
        </FormHelperText>
    </FormControl>
);


export type {SettingsFormFieldProps};
export default SettingsFormField;
