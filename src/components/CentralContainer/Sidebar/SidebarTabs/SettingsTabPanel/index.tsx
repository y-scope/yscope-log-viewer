import React, {useCallback} from "react";

import {
    Box,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Link,
    Textarea,
} from "@mui/joy";

import useNotificationStore from "../../../../../stores/notificationStore";
import useViewStore from "../../../../../stores/viewStore";
import {Nullable} from "../../../../../typings/common";
import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../../../../../typings/config";
import {LOG_LEVEL} from "../../../../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../../../../typings/notifications";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import {ACTION_NAME} from "../../../../../utils/actions";
import {
    getConfig,
    setConfig,
} from "../../../../../utils/config";
import CustomTabPanel from "../CustomTabPanel";
import ThemeSwitchFormField from "./ThemeSwitchFormField";

import "./index.css";


/**
 * Gets form fields information for user input of configuration values.
 *
 * @return A list of form fields information.
 */
const getConfigFormFields = () => [
    {
        helperText: (
            <span>
                [Structured] Format string for formatting a structured log event as plain text.
                Leave blank to display the entire log event. See
                {" "}
                <Link
                    href={"https://docs.yscope.com/yscope-log-viewer/main/user-guide/struct-logs/format/index.html"}
                    level={"body-sm"}
                    rel={"noopener"}
                    target={"_blank"}
                >
                    here
                </Link>
                {" "}
                for syntax.
            </span>
        ),
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).formatString,
        key: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
        label: "Decoder: Format string",
        type: "text",
    },
    {
        helperText: (
            <span>
                [Structured] Key that maps to each log event&apos;s log level. See
                {" "}
                <Link
                    href={"https://docs.yscope.com/yscope-log-viewer/main/user-guide/struct-logs/specifying-keys.html#syntax"}
                    level={"body-sm"}
                    rel={"noopener"}
                    target={"_blank"}
                >
                    here
                </Link>
                {" "}
                for syntax.
            </span>
        ),
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).logLevelKey,
        key: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
        label: "Decoder: Log level key",
        type: "text",
    },
    {
        helperText: (
            <span>
                [Structured] Key that maps to each log event&apos;s timestamp. See
                {" "}
                <Link
                    href={"https://docs.yscope.com/yscope-log-viewer/main/user-guide/struct-logs/specifying-keys.html#syntax"}
                    level={"body-sm"}
                    rel={"noopener"}
                    target={"_blank"}
                >
                    here
                </Link>
                {" "}
                for syntax.
            </span>
        ),
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).timestampKey,
        key: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
        label: "Decoder: Timestamp key",
        type: "text",
    },
    {
        helperText: "Number of log messages to display per page.",
        initialValue: getConfig(CONFIG_KEY.PAGE_SIZE),
        key: LOCAL_STORAGE_KEY.PAGE_SIZE,
        label: "View: Page size",
        type: "number",
    },
];

/**
 * Handles the reset event for the configuration form.
 *
 * @param ev
 */
const handleConfigFormReset = (ev: React.FormEvent) => {
    ev.preventDefault();
    window.localStorage.clear();
    window.location.reload();
};

/**
 * Displays a setting tab panel for configurations.
 *
 * @return
 */
const SettingsTabPanel = () => {
    const postPopUp = useNotificationStore((state) => state.postPopUp);
    const loadPageByAction = useViewStore((state) => state.loadPageByAction);

    const handleConfigFormSubmit = useCallback((ev: React.FormEvent) => {
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);
        const getFormDataValue = (key: string) => formData.get(key) as string;

        const formatString = getFormDataValue(LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING);
        const logLevelKey = getFormDataValue(LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY);
        const timestampKey = getFormDataValue(LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY);
        const pageSize = getFormDataValue(LOCAL_STORAGE_KEY.PAGE_SIZE);

        let error: Nullable<string> = null;
        error ||= setConfig({
            key: CONFIG_KEY.DECODER_OPTIONS,
            value: {formatString, logLevelKey, timestampKey},
        });
        error ||= setConfig({
            key: CONFIG_KEY.PAGE_SIZE,
            value: Number(pageSize),
        });

        if (null !== error) {
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: error,
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Unable to apply config.",
            });
        } else {
            loadPageByAction({code: ACTION_NAME.RELOAD, args: null});
        }
    }, [
        loadPageByAction,
        postPopUp,
    ]);

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SETTINGS}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SETTINGS]}
        >
            <form
                className={"settings-tab-container"}
                tabIndex={-1}
                onReset={handleConfigFormReset}
                onSubmit={handleConfigFormSubmit}
            >
                <Box className={"settings-form-fields-container"}>
                    <ThemeSwitchFormField/>
                    {getConfigFormFields().map((field, index) => (
                        <FormControl key={index}>
                            <FormLabel>
                                {field.label}
                            </FormLabel>
                            {"number" === field.type ?
                                <Input
                                    defaultValue={field.initialValue}
                                    name={field.key}
                                    type={"number"}/> :
                                <Textarea
                                    defaultValue={field.initialValue}
                                    name={field.key}/>}
                            <FormHelperText>
                                {field.helperText}
                            </FormHelperText>
                        </FormControl>
                    ))}
                </Box>
                <Divider/>
                <Button
                    color={"primary"}
                    type={"submit"}
                >
                    Apply
                </Button>
                <Button
                    color={"neutral"}
                    type={"reset"}
                >
                    Reset Default
                </Button>
            </form>
        </CustomTabPanel>
    );
};

export default SettingsTabPanel;
