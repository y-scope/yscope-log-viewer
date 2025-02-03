import axios from "axios";

import {Nullable} from "../typings/common";
import {
    CONFIG_KEY,
    ConfigMap,
    ConfigUpdateEntry,
    ConfigUpdates,
    getLocalStorageKeyFromProfileName,
    getProfileNameFromLocalStorageKey,
    isLocalStorageKeyProfile,
    LOCAL_STORAGE_KEY,
    Profile,
    PROFILE_MANAGED_CONFIG_KEY,
    ProfileName,
    THEME_NAME,
} from "../typings/config";
import {TAB_NAME} from "../typings/tab";


const EXPORT_LOGS_CHUNK_SIZE = 10_000;
const MAX_PAGE_SIZE = 1_000_000;
const QUERY_CHUNK_SIZE = 10_000;

/**
 * Exception to be thrown when the "THEME" configuration is specified.
 */
const UNMANAGED_THEME_THROWABLE = new Error(
    `"${CONFIG_KEY.THEME}" cannot be managed using these utilities.`,
);

/**
 * The default configuration values.
 */
const CONFIG_DEFAULT: ConfigMap = Object.freeze({
    // Global
    [CONFIG_KEY.INITIAL_TAB_NAME]: TAB_NAME.FILE_INFO,
    [CONFIG_KEY.THEME]: THEME_NAME.SYSTEM,

    // Profile managed
    [CONFIG_KEY.DECODER_OPTIONS]: {
        formatString: "",
        logLevelKey: "log.level",
        timestampKey: "@timestamp",
    },
    [CONFIG_KEY.PAGE_SIZE]: 10_000,
});

// Global variables
const DEFAULT_PROFILE_NAME = "Default";
const DEFAULT_PROFILE: Profile = {
    config: structuredClone(CONFIG_DEFAULT),
    filePathPrefixes: [],
    lastModificationTimestampMillis: Date.now(),
};

let activatedProfileName: string = DEFAULT_PROFILE_NAME;
const PROFILES: Map<string, Profile> = new Map([[DEFAULT_PROFILE_NAME,
    DEFAULT_PROFILE]]);

/**
 * Initializes the profile system, loads profiles, and activates the appropriate profile.
 *
 * @param initProps Initialization properties containing the file path.
 * @param initProps.filePath
 * @return The name of the activated profile.
 */
const initProfiles = async (initProps: {filePath: Nullable<string>}) => {
    PROFILES.clear();
    PROFILES.set(DEFAULT_PROFILE_NAME, DEFAULT_PROFILE);

    // Load profiles from profile-presets.json
    try {
        const {data} = await axios.get<Record<string, Profile>>("profile-presets.json");
        Object.entries(data).forEach(([profileName, profileData]) => {
            PROFILES.set(profileName, profileData);
        });
    } catch (e) {
        console.error(`Failed to fetch profile-presets.json: ${JSON.stringify(e)}`);
    }

    Object.keys(window.localStorage).forEach((key: string) => {
        if (isLocalStorageKeyProfile(key)) {
            const profileName = getProfileNameFromLocalStorageKey(key);
            const profileStr = window.localStorage.getItem(key);

            // The `null` check is to satisfy TypeScript.
            if (null === profileStr) {
                return;
            }

            try {
                // FIXME
                const profile = JSON.parse(profileStr) as Profile;
                const existingProfile = PROFILES.get(profileName);
                if (
                    "undefined" === typeof existingProfile ||
                    existingProfile.lastModificationTimestampMillis <
                        profile.lastModificationTimestampMillis
                ) {
                    PROFILES.set(profileName, profile);
                }
            } catch (e) {
                console.error(
                    `Error parsing profile ${profileName} from localStorage: ${String(e)}`,
                );
            }
        }
    });

    // Preset and localStorage profiles loading is completed.
    const profileOverride = window.localStorage.getItem(LOCAL_STORAGE_KEY.PROFILE_OVERRIDE);
    if (null !== profileOverride) {
        console.log("Profile override detected:", profileOverride);
        activatedProfileName = profileOverride;

        return;
    }

    // Determine profile based on filePath
    const {filePath} = initProps;
    if (null !== filePath) {
        let bestMatchEndIdx = 0;
        PROFILES.forEach((profile, profileName) => {
            for (const prefix of profile.filePathPrefixes) {
                const matchBeginIdx = filePath.indexOf(prefix);
                if (-1 !== matchBeginIdx) {
                    const matchEndIdx = matchBeginIdx + prefix.length;
                    if (matchEndIdx > bestMatchEndIdx) {
                        bestMatchEndIdx = matchBeginIdx;
                        activatedProfileName = profileName;
                    }
                }
            }
        });
    }

    console.log("Activated profile:", activatedProfileName);
};

// Helpers

/**
 * Validates the config denoted by the given key and value.
 *
 * @param props
 * @param props.key
 * @param props.value
 * @return `null` if the value is valid, or an error message otherwise.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const testConfig = ({key, value}: ConfigUpdateEntry): Nullable<string> => {
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
        default:
            break;
    }

    return result;
};

/**
 *
 * @param profileName
 */
const getProfile = (profileName: ProfileName): Profile => {
    const profile = PROFILES.get(profileName);
    if ("undefined" === typeof profile) {
        throw new Error(`Profile "${profile}" is not found`);
    }

    return profile;
};

/**
 *
 */
const getActivatedProfile = (): Profile => getProfile(activatedProfileName);

/**
 *
 * @param profileName
 * @param profile
 */
const saveProfile = (profileName: ProfileName, profile: Profile): void => {
    const profileKey = getLocalStorageKeyFromProfileName(profileName);
    profile.lastModificationTimestampMillis = Date.now();
    window.localStorage.setItem(profileKey, JSON.stringify(profile));
};


/**
 *
 * @param updates
 * @param profileName
 */
const updateConfig = (
    updates: ConfigUpdates,
    profileName: ProfileName = activatedProfileName
): string[] => {
    const errorList = [];
    const profile = getProfile(profileName);

    for (const [key, value] of Object.entries(updates)) {
        const updateEntry = {
            key: key as CONFIG_KEY,
            value: value,
        } as ConfigUpdateEntry;
        const error = testConfig(updateEntry);
        if (null !== error) {
            errorList.push(error);
        }
        switch (updateEntry.key) {
            // Global
            case CONFIG_KEY.INITIAL_TAB_NAME:
                window.localStorage.setItem(
                    LOCAL_STORAGE_KEY.INITIAL_TAB_NAME,
                    updateEntry.value.toString()
                );
                break;
            case CONFIG_KEY.THEME:
                throw UNMANAGED_THEME_THROWABLE;

            // Profile managed
            case CONFIG_KEY.DECODER_OPTIONS:
            case CONFIG_KEY.PAGE_SIZE:
                // @ts-expect-error TypeScript does not narrow types in cascading case statements.
                profile.config[updateEntry.key as PROFILE_MANAGED_CONFIG_KEY] = updateEntry.value;
                break;
            default: break;
        }
    }

    saveProfile(profileName, profile);

    return errorList;
};

/**
 * Retrieves the config value for the specified key.
 *
 * @param key
 * @return The value.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const getConfig = <T extends CONFIG_KEY>(key: T): ConfigMap[T] => {
    let value = null;
    switch (key) {
        // Global
        case CONFIG_KEY.INITIAL_TAB_NAME: {
            const storedValue = window.localStorage.getItem(LOCAL_STORAGE_KEY.INITIAL_TAB_NAME);
            value = (null === storedValue) ?
                CONFIG_DEFAULT[CONFIG_KEY.INITIAL_TAB_NAME] :
                storedValue as TAB_NAME;
            break;
        }
        case CONFIG_KEY.THEME:
            throw UNMANAGED_THEME_THROWABLE;

        // Profile managed
        case CONFIG_KEY.DECODER_OPTIONS:
        case CONFIG_KEY.PAGE_SIZE: {
            const {config: activatedConfig} = getActivatedProfile();
            value = activatedConfig[key as PROFILE_MANAGED_CONFIG_KEY];
            break;
        }
        default: break;
    }

    return value as ConfigMap[T];
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

    const profileKey = getLocalStorageKeyFromProfileName(profileName);
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

export {
    CONFIG_DEFAULT,
    deleteProfile,
    EXPORT_LOGS_CHUNK_SIZE,
    getConfig,
    initProfiles,
    lockProfile,
    MAX_PAGE_SIZE,
    QUERY_CHUNK_SIZE,
    testConfig,
    UNMANAGED_THEME_THROWABLE,
    updateConfig,
};
