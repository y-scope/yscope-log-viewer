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
import {StateContext} from "../../../contexts/StateContextProvider";
import {Nullable} from "../../../typings/common";
import {
    CONFIG_KEY,
    LOCAL_STORAGE_KEY,
} from "../../../typings/config";
import {LOG_LEVEL} from "../../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../../typings/notifications";
import {ACTION_NAME} from "../../../utils/actions";
import {
    getConfig,
    setConfig,
} from "../../../utils/config";
import ThemeSwitchFormField from "./ThemeSwitchFormField";


/**
 * Gets form fields information for user input of configuration values.
 *
 * @return A list of form fields information.
 */
const getConfigFormFields = () => [
    {
        helperText: (
            <span>
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
        helperText: "Day.js format string for timestamp",
        initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS).timestampFormatString,
        label: "View: Timestamp Format String",
        name: LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_FORMAT_STRING,
        type: "string",
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
    const {loadPageByAction, setIsSettingsModalOpen} = useContext(StateContext);

    const handleConfigFormSubmit = useCallback((ev: React.FormEvent) => {
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);
        const getFormDataValue = (key: string) => formData.get(key) as string;

        const formatString = getFormDataValue(LOCAL_STORAGE_KEY.DECODER_OPTIONS_FORMAT_STRING);
        const logLevelKey = getFormDataValue(LOCAL_STORAGE_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY);
        const timestampKey = getFormDataValue(LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_KEY);
        const timestampFormatString = getFormDataValue(
            LOCAL_STORAGE_KEY.DECODER_OPTIONS_TIMESTAMP_FORMAT_STRING
        );
        const pageSize = getFormDataValue(LOCAL_STORAGE_KEY.PAGE_SIZE);

        let error: Nullable<string> = null;
        error ||= setConfig({
            key: CONFIG_KEY.DECODER_OPTIONS,
            value: {formatString, logLevelKey, timestampKey, timestampFormatString},
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
            setIsSettingsModalOpen(false);
        }
    }, [
        loadPageByAction,
        postPopUp,
        setIsSettingsModalOpen,
    ]);

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
                    Settings
                </DialogTitle>
                <DialogContent>
                    <ThemeSwitchFormField/>
                    {getConfigFormFields().map((field, index) => (
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
                        Apply
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
