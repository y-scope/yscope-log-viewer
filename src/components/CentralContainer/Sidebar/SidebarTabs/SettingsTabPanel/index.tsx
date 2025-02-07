import React, {
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    Box,
    Button,
    Divider,
    Dropdown,
    FormControl,
    FormHelperText,
    FormLabel,
    IconButton,
    Input,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    Option,
    Select,
    Stack,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/joy";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import SdStorageIcon from "@mui/icons-material/SdStorage";

import {NotificationContext} from "../../../../../contexts/NotificationContextProvider";
import {StateContext} from "../../../../../contexts/StateContextProvider";
import {
    CONFIG_KEY,
    ProfileName,
} from "../../../../../typings/config";
import {LOG_LEVEL} from "../../../../../typings/logs";
import {DO_NOT_TIMEOUT_VALUE} from "../../../../../typings/notifications";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import {ACTION_NAME} from "../../../../../utils/actions";
import {
    createProfile,
    DEFAULT_PROFILE_NAME,
    deleteLocalStorageProfile,
    forceProfile,
    getConfig,
    listProfiles,
    ProfileMetadata,
    updateConfig,
} from "../../../../../utils/config";
import {defer} from "../../../../../utils/time";
import CustomTabPanel from "../CustomTabPanel";
import ThemeSwitchField from "./ThemeSwitchField";

import "./index.css";


/**
 *
 * @param profileName
 */
const getConfigFormFields = (profileName: ProfileName) => {
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
            initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS_FORMAT_STRING, profileName),
            key: CONFIG_KEY.DECODER_OPTIONS_FORMAT_STRING,
            label: "Decoder: Format string",
            type: "text",
        },
        {
            helperText: "[JSON] Key to extract the log level from.",
            initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY, profileName),
            key: CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY,
            label: "Decoder: Log level key",
            type: "text",
        },
        {
            helperText: "[JSON] Key to extract the log timestamp from.",
            initialValue: getConfig(CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY, profileName),
            key: CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY,
            label: "Decoder: Timestamp key",
            type: "text",
        },
    ];
};

/**
 * Displays a panel for FIXME
 *
 * @return
 */
const SettingsTabPanel = () => {
    const {postPopUp} = useContext(NotificationContext);
    const {activatedProfileName, loadPageByAction} = useContext(StateContext);
    const [newProfileName, setNewProfileName] = useState<string>("");
    const [selectedProfileName, setSelectedProfileName] = useState<ProfileName>(
        activatedProfileName ?? DEFAULT_PROFILE_NAME,
    );
    const [profilesMetadata, setProfilesMetadata] =
        useState<ReadonlyMap<ProfileName, ProfileMetadata>>(listProfiles());
    const [canApply, setCanApply] = useState<boolean>(false);

    const handleConfigFormSubmit = useCallback((ev: React.FormEvent) => {
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);
        const getFormDataValue = (key: string) => formData.get(key) as string;

        const formatString = getFormDataValue(CONFIG_KEY.DECODER_OPTIONS_FORMAT_STRING);
        const logLevelKey = getFormDataValue(CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY);
        const timestampKey = getFormDataValue(CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY);
        const pageSize = Number(getFormDataValue(CONFIG_KEY.PAGE_SIZE));

        const errorList = updateConfig(
            {
                [CONFIG_KEY.DECODER_OPTIONS_FORMAT_STRING]: formatString,
                [CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY]: logLevelKey,
                [CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY]: timestampKey,
                [CONFIG_KEY.PAGE_SIZE]: pageSize,
            },
            selectedProfileName,
        );

        for (const error of errorList) {
            postPopUp({
                level: LOG_LEVEL.ERROR,
                message: error,
                timeoutMillis: DO_NOT_TIMEOUT_VALUE,
                title: "Unable to apply config.",
            });
        }

        setProfilesMetadata(listProfiles());
        setCanApply(false);
        setSelectedProfileName(DEFAULT_PROFILE_NAME);
        loadPageByAction({code: ACTION_NAME.RELOAD, args: null});
    }, [
        loadPageByAction,
        postPopUp,
        selectedProfileName,
    ]);

    useEffect(() => {
        if (null === activatedProfileName) {
            return;
        }

        // The activated profile changes when the profile system is initialized / re-initialized.
        setSelectedProfileName(activatedProfileName);

        // Which means the profiles' metadata may have changed.
        setProfilesMetadata(listProfiles());
    }, [activatedProfileName]);

    const isSelectedProfileLocalStorage = profilesMetadata.get(selectedProfileName)?.isLocalStorage ?? false;
    const isSelectedProfileForced = profilesMetadata.get(selectedProfileName)?.isForced ?? false;

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SETTINGS}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SETTINGS]}
        >
            <form
                style={{overflowY: "hidden", display: "flex", flexDirection: "column"}}
                tabIndex={-1}
                onSubmit={handleConfigFormSubmit}
                onChange={() => {
                    setCanApply(true);
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        gap: "1rem",
                        overflowY: "auto",
                    }}
                >
                    <ThemeSwitchField/>
                    <FormControl>
                        <FormLabel>View: Page Size</FormLabel>
                        <Input
                            defaultValue={getConfig(CONFIG_KEY.PAGE_SIZE)}
                            name={CONFIG_KEY.PAGE_SIZE}
                            type={"number"}/>
                        <FormHelperText>Number of log messages to display per page.</FormHelperText>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Profile</FormLabel>
                        <Stack
                            direction={"row"}
                            gap={0.3}
                        >
                            <Select
                                size={"sm"}
                                sx={{flexGrow: 1}}
                                value={selectedProfileName}
                                endDecorator={
                                    <ToggleButtonGroup
                                        size={"sm"}
                                        spacing={0.1}
                                        variant={"soft"}
                                        value={[isSelectedProfileForced ?
                                            "forced" :
                                            ""]}
                                    >
                                        {isSelectedProfileLocalStorage && (
                                            <Dropdown>
                                                <Tooltip title={"Delete locally stored profile"}>
                                                    <MenuButton
                                                        size={"sm"}
                                                        sx={{paddingInline: "3px", zIndex: 10}}
                                                    >
                                                        <DeleteIcon/>
                                                    </MenuButton>
                                                </Tooltip>
                                                <Menu
                                                    placement={"top-start"}
                                                    size={"sm"}
                                                >
                                                    <MenuItem
                                                        onClick={() => {
                                                            deleteLocalStorageProfile(
                                                                selectedProfileName,
                                                            );
                                                            window.location.reload();
                                                        }}
                                                    >
                                                        Confirm deletion
                                                    </MenuItem>
                                                </Menu>
                                            </Dropdown>
                                        )}
                                        <Tooltip title={"Force this profile on all file paths"}>
                                            <IconButton
                                                value={"forced"}
                                                variant={"soft"}
                                                onClick={() => {
                                                    const newForcedProfileName =
                                                        isSelectedProfileForced ?
                                                            null :
                                                            selectedProfileName;

                                                    forceProfile(newForcedProfileName);
                                                    setProfilesMetadata(listProfiles());
                                                    setSelectedProfileName(DEFAULT_PROFILE_NAME);
                                                    loadPageByAction({
                                                        code: ACTION_NAME.RELOAD,
                                                        args: null,
                                                    });
                                                }}
                                            >
                                                <LockIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </ToggleButtonGroup>
                                }
                                onChange={(_, newValue) => {
                                    if (null === newValue || "string" !== typeof newValue) {
                                        throw new Error(`Unexpected newValue: ${newValue}`);
                                    }
                                    setSelectedProfileName(newValue);
                                }}
                            >
                                {Array.from(profilesMetadata).map(([profileName, metadata]) => (
                                    <Option
                                        key={profileName}
                                        value={profileName}
                                    >
                                        <Typography sx={{flexGrow: 1}}>
                                            {profileName}
                                        </Typography>
                                        <Stack
                                            direction={"row"}
                                            gap={1}
                                        >
                                            {metadata.isLocalStorage && (
                                                <Tooltip title={"Locally stored"}>
                                                    <SdStorageIcon/>
                                                </Tooltip>
                                            )}
                                            {metadata.isForced && (
                                                <Tooltip title={"Forced"}>
                                                    <LockIcon/>
                                                </Tooltip>
                                            )}
                                            {activatedProfileName === profileName && (
                                                <Tooltip title={"Active"}>
                                                    <CheckBoxIcon/>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </Option>
                                ))}
                            </Select>
                            <Dropdown>
                                <MenuButton
                                    size={"sm"}
                                    sx={{paddingInline: "6px"}}
                                    variant={"soft"}
                                >
                                    <AddIcon/>
                                </MenuButton>
                                <Menu
                                    placement={"bottom-end"}
                                    size={"sm"}
                                >
                                    <Stack
                                        direction={"row"}
                                        paddingInline={1}
                                        spacing={1}
                                    >
                                        <FormControl>
                                            <Input
                                                placeholder={"New Profile Name"}
                                                size={"sm"}
                                                sx={{minWidth: "24ch"}}
                                                value={newProfileName}
                                                onChange={(ev) => {
                                                    setNewProfileName(ev.target.value);
                                                    defer(() => {
                                                        // Prevent the confirm button from receiving
                                                        // focus when the input value changes.
                                                        ev.target.focus();
                                                    });
                                                }}/>
                                        </FormControl>
                                        <MenuItem
                                            disabled={0 === newProfileName.length}
                                            sx={{borderRadius: "2px"}}
                                            onClick={() => {
                                                const result = createProfile(newProfileName);
                                                if (result) {
                                                    setProfilesMetadata(listProfiles);
                                                    setSelectedProfileName(newProfileName);
                                                }
                                            }}
                                        >
                                            <CheckIcon/>
                                        </MenuItem>
                                    </Stack>
                                </Menu>
                            </Dropdown>
                        </Stack>
                        <FormHelperText>
                            Below fields are managed by the selected profile.
                        </FormHelperText>
                    </FormControl>

                    {getConfigFormFields(selectedProfileName).map((field, index) => (
                        <FormControl key={index}>
                            <FormLabel>
                                {field.label}
                            </FormLabel>
                            <Input
                                defaultValue={field.initialValue}
                                name={field.key}
                                type={field.type}/>
                            <FormHelperText>
                                {field.helperText}
                            </FormHelperText>
                        </FormControl>
                    ))}
                </Box>
                <Divider/>
                <Button
                    disabled={false === canApply}
                    sx={{marginTop: "0.75rem"}}
                    type={"submit"}
                >
                    Apply
                </Button>
            </form>
        </CustomTabPanel>
    );
};

export default SettingsTabPanel;
