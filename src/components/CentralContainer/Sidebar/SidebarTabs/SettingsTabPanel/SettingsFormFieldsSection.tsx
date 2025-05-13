import React from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from "@mui/joy";

import SettingsFormField, {SettingsFormFieldProps} from "./SettingsFormField";


interface SettingsFormFieldsSectionProps {
    name: string;
    fields: Array<React.ReactNode | SettingsFormFieldProps>;
}

/**
 * Displays a section of form fields for user input of configuration values.
 *
 * @param props
 * @param props.fields
 * @param props.name
 * @return
 */
const SettingsFormFieldsSection = ({
    fields,
    name,
}: SettingsFormFieldsSectionProps) => (
    <Accordion defaultExpanded={true}>
        <AccordionSummary variant={"soft"}>
            {name}
        </AccordionSummary>
        <AccordionDetails>
            {fields.map(
                (f, index) => (
                    React.isValidElement(f) ?
                        f :
                        <SettingsFormField
                            key={index}
                            {...(f as SettingsFormFieldProps)}/>
                )
            )}
        </AccordionDetails>
    </Accordion>
);


export default SettingsFormFieldsSection;
