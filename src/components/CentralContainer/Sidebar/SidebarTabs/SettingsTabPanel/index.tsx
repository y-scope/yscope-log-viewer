import React, {
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import {
    Box,
    FormControl,
    FormHelperText,
    FormLabel,
    IconButton,
    Input,
    Link,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from "@mui/joy";

import CheckIcon from "@mui/icons-material/Check";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import {NotificationContext} from "../../../../../contexts/NotificationContextProvider";
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
import {getConfig} from "../../../../../utils/config";
import CustomTabPanel from "../CustomTabPanel";
import PanelTitleButton from "../PanelTitleButton";
import ThemeSwitchToggle from "./ThemeSwitchToggle";

import "./index.css";


/**
 *
 * @param profileName
 */
const getConfigFormFields = (profileName) => {
    return [
        {
            helperText: (
                <span>
                    {"[JSON] Format string for formatting a JSON log event as plain text. See the "}
                    <Link
                        href={"https://docs.yscope.com/yscope-log-viewer/main/user-guide/format-struct-logs-overview.html"}
                        level={"body-sm"}
                        rel={"noopener"}
                        target={"_blank"}
                    >
                        format string syntax docs
                    </Link>
                    {" or leave this blank to display the entire log event."}
                </span>
            ),
            initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).formatString,
            label: "Decoder: Format string",
            name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING,
            type: "text",
        },
        {
            helperText: "[JSON] Key to extract the log level from.",
            initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).logLevelKey,
            label: "Decoder: Log level key",
            name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
            type: "text",
        },
        {
            helperText: "[JSON] Key to extract the log timestamp from.",
            initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).timestampKey,
            label: "Decoder: Timestamp key",
            name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
            type: "text",
        },
        {
            helperText: "Number of log messages to display per page.",
            initialValue: getConfig(CONFIG_KEY.PAGE_SIZE),
            label: "View: Page size",
            name: LOCAL_STORAGE_KEY.PAGE_SIZE,
            type: "number",
        },
    ];
};

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
 * Displays a panel for FIXME
 *
 * @return
 */
const SettingsTabPanel = () => {
    const {postPopUp} = useContext(NotificationContext);

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
            window.location.reload();
        }
    }, [postPopUp]);

    return (
        <form
            tabIndex={-1}
            onReset={handleConfigFormReset}
            onSubmit={handleConfigFormSubmit}
        >
            <CustomTabPanel
                tabName={TAB_NAME.SETTINGS}
                title={TAB_DISPLAY_NAMES[TAB_NAME.SETTINGS]}
                titleButtons={
                    <>
                        <PanelTitleButton
                            color={"neutral"}
                            title={"Reset Default"}
                            type={"reset"}
                        >
                            <RestartAltIcon/>
                        </PanelTitleButton>
                        <PanelTitleButton
                            color={"primary"}
                            title={"Apply & Reload"}
                            type={"submit"}
                        >
                            <CheckIcon/>
                        </PanelTitleButton>
                    </>
                }
            >
                <ThemeSwitchToggle/>

                {getConfigFormFields("something").map((field, index) => (
                    <FormControl
                        className={"config-form-control"}
                        key={index}
                    >
                        <FormLabel>
                            {field.label}
                        </FormLabel>
                        <Input
                            defaultValue={field.initialValue}
                            name={field.name}
                            type={field.type}/>
                        <FormHelperText>
                            {field.helperText}
                        </FormHelperText>
                    </FormControl>
                ))}
            </CustomTabPanel>
        </form>
    );
};


export default SettingsTabPanel;
