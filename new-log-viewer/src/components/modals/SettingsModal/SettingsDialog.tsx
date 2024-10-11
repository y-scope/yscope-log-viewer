import React, {
    forwardRef,
    useContext,
} from "react";

import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    ModalDialog,
} from "@mui/joy";
import FormControl from "@mui/joy/FormControl/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import FormLabel from "@mui/joy/FormLabel/FormLabel";
import Input from "@mui/joy/Input";

import {
    DO_NOT_TIMEOUT_VALUE,
    NotificationContext,
} from "../../../contexts/NotificationContextProvider";
import {Nullable} from "../../../typings/common";
import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../../../typings/config";
import {LOG_LEVEL} from "../../../typings/logs";
import {
    getConfig,
    setConfig,
} from "../../../utils/config";
import ThemeSwitchToggle from "./ThemeSwitchToggle";


const CONFIG_FORM_FIELDS = [
    {
        helperText: "[JSON] Log messages conversion formats.",
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
 * Generates a handler for the submit event for the configuration form.
 *
 * @return the generated handler.
 */
const useHandleConfigFormSubmit = () => {
    const {postPopup} = useContext(NotificationContext);

    return (ev: React.FormEvent) => {
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
            postPopup(LOG_LEVEL.ERROR, error, "Unable to apply config.", DO_NOT_TIMEOUT_VALUE);
        } else {
            window.location.reload();
        }
    };
};

/**
 * Renders a settings dialog for configurations.
 *
 * @return
 */
const SettingsDialog = forwardRef<HTMLFormElement>((_, ref) => {
    const handleConfigFormSubmit = useHandleConfigFormSubmit();

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
