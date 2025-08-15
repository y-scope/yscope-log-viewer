import React from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from "@mui/joy";

import SettingsFormField, {SettingsFormFieldProps} from "./SettingsFormField";
import {SettingsFormFields} from "./SettingsFormFieldSectionsGroup";

import "./SettingsFormFieldsSection.css";


interface SettingsFormFieldsSectionProps {
    name: string;
    fields: SettingsFormFields[];
}

/**
 * Displays a section of form fields for user input of configuration values.
 *
 * @param props
 * @param props.fields A list of form fields information or React nodes.
 * @param props.name
 * @return
 */
const SettingsFormFieldsSection = ({
    fields,
    name,
}: SettingsFormFieldsSectionProps) => (
    <Accordion defaultExpanded={true}>
        <AccordionSummary
            className={"settings-form-field-section-summary"}
            variant={"soft"}
        >
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
