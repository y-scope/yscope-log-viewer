import React from "react";

import {
    Box,
    Divider,
    FormControl,
    FormLabel,
    Input,
    Option,
    Select,
    Textarea,
    Typography,
} from "@mui/joy";

import pluginRegistry from "../../../../../services/PluginRegistry";
import pluginContext from "../../../../../services/PluginRegistry/PluginContext";
import type {PluginConfigField} from "../../../../../typings/plugin";


/**
 * Renders a single plugin config field.
 *
 * @param root0
 * @param root0.field
 * @param root0.pluginId
 * @return
 */
const PluginConfigFieldRenderer = ({
    field,
    pluginId,
}: {
    field: PluginConfigField;
    pluginId: string;
}) => {
    const currentValue = pluginContext.getConfig(pluginId, field.key) ??
        String(field.defaultValue);

    return (
        <FormControl>
            <FormLabel>
                {field.label}
            </FormLabel>
            {(() => {
                switch (field.type) {
                    case "number":
                        return (
                            <Input
                                defaultValue={currentValue}
                                name={`plugin.${pluginId}.${field.key}`}
                                type={"number"}/>
                        );
                    case "boolean":
                        return (
                            <Select
                                defaultValue={currentValue}
                                name={`plugin.${pluginId}.${field.key}`}
                            >
                                <Option value={"true"}>true</Option>
                                <Option value={"false"}>false</Option>
                            </Select>
                        );
                    case "select":
                        return (
                            <Select
                                defaultValue={currentValue}
                                name={`plugin.${pluginId}.${field.key}`}
                            >
                                {field.options?.map((opt) => (
                                    <Option
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </Option>
                                ))}
                            </Select>
                        );
                    default:
                        return (
                            <Textarea
                                defaultValue={currentValue}
                                name={`plugin.${pluginId}.${field.key}`}/>
                        );
                }
            })()}
        </FormControl>
    );
};

/**
 * Renders plugin configuration sections in the settings panel.
 *
 * @return
 */
const PluginConfigSections = () => (
    <>
        {pluginRegistry.getAllPlugins()
            .filter((p) => p.configSchema && 0 < p.configSchema.length)
            .map((plugin) => (
                <Box key={plugin.id}>
                    <Typography
                        level={"body-md"}
                        sx={{fontWeight: "bold", mb: 1}}
                    >
                        {plugin.name}
                    </Typography>
                    {plugin.configSchema
                        ?.filter((field) => !field.secret)
                        .map((field: PluginConfigField) => (
                            <PluginConfigFieldRenderer
                                field={field}
                                key={field.key}
                                pluginId={plugin.id}/>
                        ))}
                    <Divider/>
                </Box>
            ))}
    </>
);

export default PluginConfigSections;
