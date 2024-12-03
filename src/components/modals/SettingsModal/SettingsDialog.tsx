import React, {
    forwardRef,
    useCallback,
    useContext,
} from "react";

import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Link,
    ModalDialog,
} from "@mui/joy";

import {NotificationContext} from "../../../contexts/NotificationContextProvider";
import {Nullable} from "../../../typings/common";
import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../../../typings/config";
import {LOG_LEVEL} from "../../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../../typings/notifications";
import {
    getConfig,
    setConfig,
} from "../../../utils/config";
import ThemeSwitchToggle from "./ThemeSwitchToggle";


const CONFIG_FORM_FIELDS = [
    {
        helperText: (
            <p>
                [JSON] Format string for formatting a JSON log event as plain text. See the
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
            </p>
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
 * Renders a settings dialog for configurations.
 *
 * @return
 */
const SettingsDialog = forwardRef<HTMLFormElement>((_, ref) => {
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
            ref={ref}
            tabIndex={-1}
            onReset={handleConfigFormReset}
            onSubmit={handleConfigFormSubmit}
        >
            <ModalDialog
                minWidth={"md"}
                size={"lg"}
            >
                <DialogTitle className={"settings-dialog-title"}>
                    <span className={"settings-dialog-title-text"}>
                        Settings
                    </span>
                    <ThemeSwitchToggle/>
                </DialogTitle>
                <DialogContent>
                    {CONFIG_FORM_FIELDS.map((field, index) => (
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
                </DialogContent>
                <DialogActions>
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
                </DialogActions>
            </ModalDialog>
        </form>
    );
});

SettingsDialog.displayName = "SettingsDialog";

export default SettingsDialog;
