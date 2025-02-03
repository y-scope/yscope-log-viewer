import {DecoderOptions} from "./decoders";
import {TAB_NAME} from "./tab";


enum THEME_NAME {
    SYSTEM = "system",
    DARK = "dark",
    LIGHT = "light",
}

enum GLOBAL_CONFIG_KEY {
    INITIAL_TAB_NAME = "initialTabName",
    THEME = "theme",
}

enum PROFILE_MANAGED_CONFIG_KEY {
    DECODER_OPTIONS = "decoderOptions",
    PAGE_SIZE = "pageSize",
}

/**
 *
 */
const CONFIG_KEY = Object.freeze({
    ...GLOBAL_CONFIG_KEY,
    ...PROFILE_MANAGED_CONFIG_KEY,
});

type CONFIG_KEY = GLOBAL_CONFIG_KEY | PROFILE_MANAGED_CONFIG_KEY;


// FIXME: make use of it
const APP_SPECIFIC_LOCAL_STORAGE_KEY_PREFIX = "com.yscope.logviewer/";

const LOCAL_STORAGE_KEY_PROFILE_PREFIX = "profile:";

/**
 *
 * @param key
 */
const isLocalStorageKeyProfile = (key: string): boolean => key.startsWith(LOCAL_STORAGE_KEY_PROFILE_PREFIX);

/**
 *
 * @param key
 */
const getProfileNameFromLocalStorageKey = (key: string): string => key.substring(LOCAL_STORAGE_KEY_PROFILE_PREFIX.length);

/**
 *
 * @param profileName
 */
const getLocalStorageKeyFromProfileName = (profileName: string): string => `${LOCAL_STORAGE_KEY_PROFILE_PREFIX}${profileName}`;

enum LOCAL_STORAGE_KEY {
    INITIAL_TAB_NAME = "initialTabName",
    THEME = "theme",
    PROFILE_OVERRIDE = "profileOverride",
}

interface ProfileManagedConfigMap {
    [PROFILE_MANAGED_CONFIG_KEY.DECODER_OPTIONS]: DecoderOptions;
    [PROFILE_MANAGED_CONFIG_KEY.PAGE_SIZE]: number;
}

interface ConfigMap {
    [GLOBAL_CONFIG_KEY.INITIAL_TAB_NAME]: TAB_NAME;
    [GLOBAL_CONFIG_KEY.THEME]: THEME_NAME;
    [PROFILE_MANAGED_CONFIG_KEY.DECODER_OPTIONS]: DecoderOptions;
    [PROFILE_MANAGED_CONFIG_KEY.PAGE_SIZE]: number;
}

type ConfigUpdates = {
    [T in keyof ConfigMap]?: ConfigMap[T];
};

type ConfigUpdateEntry = {
    [T in keyof ConfigMap]: {
        key: T;
        value: ConfigMap[T];
    }
}[keyof ConfigMap];

/**
 *
 * @param key
 * @param value
 */
const createUpdateEntry = <K extends keyof ConfigMap>(
    key: K,
    value: ConfigMap[K]
): ConfigUpdateEntry => ({key, value} as ConfigUpdateEntry);

interface Profile {
    config: ProfileManagedConfigMap;
    filePathPrefixes: string[];
    lastModificationTimestampMillis: number;
}

type ProfileName = string;

export {
    CONFIG_KEY,
    createUpdateEntry,
    getLocalStorageKeyFromProfileName,
    getProfileNameFromLocalStorageKey,
    isLocalStorageKeyProfile,
    LOCAL_STORAGE_KEY,
    PROFILE_MANAGED_CONFIG_KEY,
    THEME_NAME,
};
export type {
    ConfigMap,
    ConfigUpdateEntry,
    ConfigUpdates,
    Profile,
    ProfileName,
};
