import axios from "axios";

import {Nullable} from "../typings/common";
import {
    CONFIG_KEY,
    ConfigMap,
    ConfigUpdate,
    LOCAL_STORAGE_KEY,
    Profile,
    THEME_NAME,
} from "../typings/config";
import {TAB_NAME} from "../typings/tab";


const EXPORT_LOGS_CHUNK_SIZE = 10_000;
const MAX_PAGE_SIZE = 1_000_000;
const QUERY_CHUNK_SIZE = 10_000;

/**
 * Exception to be thrown when the "THEME" configuration is specified.
 */
const UNMANAGED_THEME_THROWABLE =
    new Error(`"${CONFIG_KEY.THEME}" cannot be managed using these utilities.`);

/**
 * The default configuration values.
 */
const CONFIG_DEFAULT: ConfigMap = Object.freeze({
    [CONFIG_KEY.DECODER_OPTIONS]: {
        formatString: "",
        logLevelKey: "log.level",
        timestampKey: "@timestamp",
    },
    [CONFIG_KEY.INITIAL_TAB_NAME]: TAB_NAME.FILE_INFO,
    [CONFIG_KEY.THEME]: THEME_NAME.SYSTEM,
    [CONFIG_KEY.PAGE_SIZE]: 10_000,
});

// Global variables
const DEFAULT_PROFILE_NAME = "Default";
const DEFAULT_PROFILE: Profile = {
    config: structuredClone(CONFIG_DEFAULT),
    filePathPrefixes: [],
    lastModificationTimestampMillis: Date.now(),
};
const activatedProfileName: string = DEFAULT_PROFILE_NAME;
const PROFILES: Map<string, Profile> = new Map(
    [
        [
            DEFAULT_PROFILE_NAME,
            DEFAULT_PROFILE,
        ],
    ]
);


// Helpers
/**
 *
 * @param profileName
 */
const getProfileLocalStorageKey =
    (profileName: string) => (LOCAL_STORAGE_KEY.PROFILE_PREFIX + profileName);

interface ProfileInitProps {
    filePath: Nullable<string>;
}

/**
 * Validates the config denoted by the given key and value.
 *
 * @param props
 * @param props.key
 * @param props.value
 * @return `null` if the value is valid, or an error message otherwise.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const testConfig = ({key, value}: ConfigUpdate): Nullable<string> => {
    let result = null;
    switch (key) {
        case CONFIG_KEY.DECODER_OPTIONS:
            if (0 === value.timestampKey.length) {
                result = "Timestamp key cannot be empty.";
            } else if (0 === value.logLevelKey.length) {
                result = "Log level key cannot be empty.";
            }
            break;
        case CONFIG_KEY.INITIAL_TAB_NAME:
            // This config option is not intended for direct user input.
            break;
        case CONFIG_KEY.PAGE_SIZE:
            if (0 >= value || MAX_PAGE_SIZE < value) {
                result = `Page size must be greater than 0 and less than ${MAX_PAGE_SIZE + 1}.`;
            }
            break;
        case CONFIG_KEY.THEME:
            throw UNMANAGED_THEME_THROWABLE;
        /* c8 ignore next */
        default: break;
    }

    return result;
};

/**
 *
 */
const getActivatedProfile = (): Profile => {
    const activatedProfile = PROFILES.get(activatedProfileName);
    if ("undefined" === typeof activatedProfile) {
        throw new Error(`Activated profile ${activatedProfileName} is not found`);
    }

    return activatedProfile;
};

/**
 * Saves the current configuration to the active profile in localStorage.
 */
const saveProfile = (): void => {
    const profileKey = getProfileLocalStorageKey(activatedProfileName);
    const profile = getActivatedProfile();
    profile.lastModificationTimestampMillis = Date.now();
    window.localStorage.setItem(profileKey, JSON.stringify(profile));
};

/**
 * Updates the config denoted by the given key and value.
 *
 * @param props
 * @param props.key
 * @param props.value
 * @return `null` if the update succeeds, or an error message otherwise.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const setConfig = ({key, value}: ConfigUpdate): Nullable<string> => {
    const error = testConfig({key, value} as ConfigUpdate);
    if (null !== error) {
        console.error(`Unable to set ${key}=${JSON.stringify(value)}: ${error}`);

        return error;
    }

    const {config: activatedConfig} = getActivatedProfile();

    // @ts-expect-error TS cannot match the key's type with the value's type
    activatedConfig[key] = value;
    saveProfile();

    return null;
};

/**
 * Retrieves the config value for the specified key.
 *
 * @param key
 * @return The value.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const getConfig = <T extends CONFIG_KEY>(key: T): ConfigMap[T] => {
    const {config: activatedConfig} = getActivatedProfile();

    return activatedConfig[key];
};

/**
 * Deletes a profile by name.
 *
 * @param profileName The name of the profile to delete.
 * @throws Error if the specified profile is currently activated.
 */
const deleteProfile = (profileName: string) => {
    if (false === PROFILES.has(profileName)) {
        throw new Error(`Deleting an unknown profile: ${profileName}`);
    }

    const profileKey = getProfileLocalStorageKey(profileName);
    window.localStorage.removeItem(profileKey);
};

/**
 * Sets a profile override and activates the specified profile.
 * If profileName is null, removes the override.
 *
 * @param profileName The name of the profile to activate or null to remove override.
 */
const lockProfile = (profileName: string | null): void => {
    if (null === profileName) {
        // Remove override
        window.localStorage.removeItem(LOCAL_STORAGE_KEY.PROFILE_OVERRIDE);

        // FIXME: Reinitialize to determine `activatedProfileName` based on filePath
        return;
    }

    if (false === PROFILES.has(profileName)) {
        throw new Error(`Locking an unknown profile: ${profileName}`);
    }
    window.localStorage.setItem(LOCAL_STORAGE_KEY.PROFILE_OVERRIDE, profileName);
};


// /**
//  * Returns the activated profile name and a list of all available profiles.
//  * FIXME: react hook
//  *
//  * @return An object containing the activated profile and list of profiles.
//  */
// const useProfiles = (): {
//     activated: string;
//     profiles: Map<string, Profile>;
// } => {
//     return {
//         activated: activatedProfileName,
//         profiles: PROFILES,
//     };
// };

export {
    CONFIG_DEFAULT,
    deleteProfile,
    EXPORT_LOGS_CHUNK_SIZE,
    getConfig,
    lockProfile,
    MAX_PAGE_SIZE,
    QUERY_CHUNK_SIZE,
    saveProfile,
    setConfig,
    testConfig,
    UNMANAGED_THEME_THROWABLE,
};
