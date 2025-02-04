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
    [CONFIG_KEY.PAGE_SIZE]: 10_000,
    [CONFIG_KEY.THEME]: THEME_NAME.SYSTEM,

    // Profile managed
    [CONFIG_KEY.DECODER_OPTIONS_FORMAT_STRING]: "",
    [CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY]: "log.level",
    [CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY]: "@timestamp",
});

interface ProfileMetadata {
    isLocalStorage: boolean;
    isForced: boolean;
}

// Global variables
const DEFAULT_PROFILE_NAME = "Default";
const DEFAULT_PROFILE: Profile = {
    config: structuredClone(CONFIG_DEFAULT),
    filePathPrefixes: [],
    lastModificationTimestampMillis: -1,
};
const DEFAULT_PROFILE_METADATA: ProfileMetadata = {
    isLocalStorage: false,
    isForced: false,
};

let activatedProfileName: ProfileName = DEFAULT_PROFILE_NAME;
const PROFILES: Map<ProfileName, Profile> = new Map([[DEFAULT_PROFILE_NAME,
    DEFAULT_PROFILE]]);
const PROFILES_METADATA: Map<ProfileName, ProfileMetadata> = new Map([[
    DEFAULT_PROFILE_NAME,
    DEFAULT_PROFILE_METADATA,
]]);


/**
 *
 * @param profileName
 * @param metadataUpdate
 */
const updateProfileMetadata = (profileName: ProfileName, metadataUpdate: Partial<ProfileMetadata>) => {
    const metadata = PROFILES_METADATA.get(profileName);
    if ("undefined" === typeof metadata) {
        throw new Error(`Profile "${profileName}" is not found`);
    }
    Object.assign(metadata, metadataUpdate);
};

/**
 * Initializes the profile system, loads profiles, and activates the appropriate profile.
 *
 * @param initProps Initialization properties containing the file path.
 * @param initProps.filePath
 * @return The name of the activated profile.
 */
const initProfiles = async (initProps: {filePath: Nullable<string>}): Promise<string> => {
    PROFILES.clear();
    PROFILES_METADATA.clear();
    PROFILES.set(DEFAULT_PROFILE_NAME, DEFAULT_PROFILE);
    PROFILES_METADATA.set(DEFAULT_PROFILE_NAME, DEFAULT_PROFILE_METADATA);

    // Load profiles from profile-presets.json
    try {
        const {data} = await axios.get<Record<string, Profile>>("profile-presets.json");
        Object.entries(data).forEach(([profileName, profileData]) => {
            PROFILES.set(profileName, profileData);
            PROFILES_METADATA.set(profileName, {isForced: false, isLocalStorage: false});
        });
    } catch (e) {
        console.error(`Failed to fetch profile-presets.json: ${JSON.stringify(e)}`);
    }

    Object.keys(window.localStorage).forEach((key: string) => {
        if (false === isLocalStorageKeyProfile(key)) {
            return;
        }
        const profileName = getProfileNameFromLocalStorageKey(key);
        const profileStr = window.localStorage.getItem(key);
        if (null === profileStr) {
            return;
        }
        try {
            // eslint-disable-next-line no-warning-comments
            // TODO: Validate parsed profile.
            const profile = JSON.parse(profileStr) as Profile;
            const existingProfile = PROFILES.get(profileName);

            // Insert the profile. If a duplicated profile name is found and the localStorage
            // profile is newer than the existing one, replace with the localStorage profile.
            if (
                "undefined" === typeof existingProfile ||
                existingProfile.lastModificationTimestampMillis <
                    profile.lastModificationTimestampMillis
            ) {
                PROFILES.set(profileName, profile);
                PROFILES_METADATA.set(profileName, {isForced: false, isLocalStorage: true});
            }
        } catch (e) {
            console.error(`Error parsing profile ${profileName} from localStorage: ${String(e)}`);
        }
    });

    // Preset and localStorage profiles loading is completed.
    // Check for forced profile override.
    const forcedProfileName = window.localStorage.getItem(LOCAL_STORAGE_KEY.FORCED_PROFILE);
    if (null !== forcedProfileName) {
        console.log("Forcing profile:", forcedProfileName);
        activatedProfileName = forcedProfileName;
        updateProfileMetadata(forcedProfileName, {isForced: true});

        return activatedProfileName;
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

    return activatedProfileName;
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
        case CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY:
            if (0 === value.length) {
                result = "Log level key cannot be empty.";
            }
            break;
        case CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY:
            if (0 === value.length) {
                result = "Timestamp key cannot be empty.";
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
 * @param profileName
 * @param profile
 */
const saveProfile = (profileName: ProfileName, profile: Profile): void => {
    const profileKey = getLocalStorageKeyFromProfileName(profileName);
    profile.lastModificationTimestampMillis = Date.now();
    window.localStorage.setItem(profileKey, JSON.stringify(profile));
    updateProfileMetadata(profileName, {isLocalStorage: true});
};

/**
 *
 * @param profileName
 */
const createProfile = (profileName: ProfileName): boolean => {
    if (PROFILES.has(profileName)) {
        console.log("Profile already exists:", profileName);

        return false;
    }

    PROFILES.set(profileName, DEFAULT_PROFILE);
    PROFILES_METADATA.set(profileName, {isForced: false, isLocalStorage: true});
    saveProfile(profileName, DEFAULT_PROFILE);
    forceProfile(profileName);

    return true;
};


/**
 *
 * @param updates
 * @param profileName
 */
const updateConfig = (
    updates: ConfigUpdates,
    profileName: Nullable<ProfileName> = activatedProfileName
): string[] => {
    if (null === profileName) {
        profileName = activatedProfileName;
    }

    const errorList = [];
    const profile = getProfile(profileName);
    let isProfileModified = false;

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
            case CONFIG_KEY.PAGE_SIZE:
                window.localStorage.setItem(
                    LOCAL_STORAGE_KEY.PAGE_SIZE,
                    updateEntry.value.toString()
                );
                break;

            // Profile managed
            case CONFIG_KEY.DECODER_OPTIONS_FORMAT_STRING:
            case CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY:
            case CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY:
                isProfileModified = true;
                profile.config[updateEntry.key as PROFILE_MANAGED_CONFIG_KEY] = updateEntry.value;
                break;
            default: break;
        }
    }

    if (isProfileModified) {
        saveProfile(profileName, profile);
    }

    return errorList;
};

/**
 * Retrieves the config value for the specified key.
 *
 * @param key
 * @param profileName
 * @return The value.
 * @throws {Error} If the config item cannot be managed by these config utilities.
 */
const getConfig = <T extends CONFIG_KEY>(
    key: T,
    profileName: Nullable<ProfileName> = activatedProfileName
): ConfigMap[T] => {
    if (null === profileName) {
        profileName = activatedProfileName;
    }

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
        case CONFIG_KEY.DECODER_OPTIONS_FORMAT_STRING:
        case CONFIG_KEY.DECODER_OPTIONS_LOG_LEVEL_KEY:
        case CONFIG_KEY.DECODER_OPTIONS_TIMESTAMP_KEY:
        case CONFIG_KEY.PAGE_SIZE: {
            const {config} = getProfile(profileName);
            value = config[key as PROFILE_MANAGED_CONFIG_KEY];
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
const forceProfile = (profileName: string | null): void => {
    const forcedProfileName = window.localStorage.getItem(LOCAL_STORAGE_KEY.FORCED_PROFILE);
    if (null !== forcedProfileName) {
        updateProfileMetadata(forcedProfileName, {isForced: false});
    }

    if (null === profileName) {
        // Remove override
        window.localStorage.removeItem(LOCAL_STORAGE_KEY.FORCED_PROFILE);

        return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY.FORCED_PROFILE, profileName);
    updateProfileMetadata(profileName, {isForced: true});
};

/**
 *
 */
const listProfiles = (): ReadonlyMap<ProfileName, ProfileMetadata> => {
    return Object.freeze(structuredClone(PROFILES_METADATA));
};


export type {ProfileMetadata};
export {
    CONFIG_DEFAULT,
    createProfile,
    DEFAULT_PROFILE_METADATA,
    DEFAULT_PROFILE_NAME,
    deleteProfile,
    EXPORT_LOGS_CHUNK_SIZE,
    forceProfile,
    getConfig,
    initProfiles,
    listProfiles,
    MAX_PAGE_SIZE,
    QUERY_CHUNK_SIZE,
    testConfig,
    UNMANAGED_THEME_THROWABLE,
    updateConfig,
};
