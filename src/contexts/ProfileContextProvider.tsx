import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {Nullable} from "../typings/common";
import {
    LOCAL_STORAGE_KEY,
    Profile,
} from "../typings/config";
import {CONFIG_DEFAULT} from "../utils/config";
import {UrlContext} from "./UrlContextProvider";


const DEFAULT_PROFILE_NAME = "Default";
const DEFAULT_PROFILE: Profile = {
    config: structuredClone(CONFIG_DEFAULT),
    filePathPrefixes: [],
    lastModificationTimestampMillis: Date.now(),
};

/**
 *
 */
const createNewProfiles = () => new Map([
    [
        DEFAULT_PROFILE_NAME,
        DEFAULT_PROFILE,
    ],
]);

interface ProfileInitProps {
    filePath: Nullable<string>;
}

interface ProfilesContextType {
    activatedProfileName: string;
    profiles: Map<string, Profile>;

    initProfiles: (initProps:ProfileInitProps) => Promise<void>;
}

const ProfilesContext = createContext({} as ProfilesContextType);

/**
 * Default values of the Profile context value object.
 */
const PROFILES_DEFAULT: Readonly<ProfilesContextType> = Object.freeze({
    activatedProfileName: DEFAULT_PROFILE_NAME,
    profiles: createNewProfiles(),

    initProfiles: async () => {
    },
});

interface ProfilesContextProviderProps {
    children: React.ReactNode;
}

/**
 *
 * @param props
 * @param props.children
 * @return
 */
const ProfilesContextProvider = ({children}: ProfilesContextProviderProps) => {
    const {filePath} = useContext(UrlContext);

    const [activatedProfileName, setActivatedProfileName] = useState<string>(PROFILES_DEFAULT.activatedProfileName);
    const [profiles, setProfiles] = useState<Map<string, Profile>>(PROFILES_DEFAULT.profiles);

    /**
     * Initializes the profile system, loads profiles, and activates the appropriate profile.
     *
     * @param initProps Initialization properties containing the file path.
     * @param initProps.filePath
     * @return The name of the activated profile.
     */
    const initProfiles = useCallback(async (initProps:ProfileInitProps) => {
        const newProfiles = createNewProfiles();

        // Load profiles from profile-presets.json
        try {
            const {data} = await axios.get<Record<string, Profile>>("profile-presets.json");
            Object.entries(data).forEach(([profileName, profileData]) => {
                newProfiles.set(profileName, profileData);
            });
        } catch (e) {
            console.error(`Failed to fetch profile-presets.json: ${JSON.stringify(e)}`);
        }

        Object.keys(window.localStorage).forEach((key: string) => {
            if (key.startsWith(LOCAL_STORAGE_KEY.PROFILE_PREFIX)) {
                const profileName = key.substring(LOCAL_STORAGE_KEY.PROFILE_PREFIX.length);
                const profileStr = window.localStorage.getItem(key);

                // The `null` check is to satisfy TypeScript.
                if (null === profileStr) {
                    return;
                }

                try {
                    // FIXME
                    const profile = JSON.parse(profileStr) as Profile;
                    const existingProfile = newProfiles.get(profileName);
                    if (
                        "undefined" === typeof existingProfile ||
                        existingProfile.lastModificationTimestampMillis <
                        profile.lastModificationTimestampMillis
                    ) {
                        newProfiles.set(profileName, profile);
                    }
                } catch (e) {
                    console.error(
                        `Error parsing profile ${profileName} from localStorage: ${String(e)}`,
                    );
                }
            }
        });

        // Preset and localStorage profiles loading is completed.
        setProfiles(newProfiles);

        const profileOverride = window.localStorage.getItem(LOCAL_STORAGE_KEY.PROFILE_OVERRIDE);
        if (null !== profileOverride) {
            // If override exist, apply the config and return
            setActivatedProfileName(profileOverride);

            return;
        }

        // Determine profile based on filePath
        const {filePath} = initProps;
        if (null !== filePath) {
            let bestMatchEndIdx = 0;
            newProfiles.forEach((profile, profileName) => {
                for (const prefix of profile.filePathPrefixes) {
                    const matchBeginIdx = filePath.indexOf(prefix);
                    if (-1 !== matchBeginIdx) {
                        const matchEndIdx = matchBeginIdx + prefix.length;
                        if (matchEndIdx > bestMatchEndIdx) {
                            bestMatchEndIdx = matchBeginIdx;
                            setActivatedProfileName(profileName);
                        }
                    }
                }
            });
        }
    }, []);

    useEffect(() => {
        initProfiles({filePath})
            .then()
            .catch((e: unknown) => {
                console.error("Unable to init profiles:", e);
            });
    }, [
        initProfiles,
        filePath,
    ]);

    return (
        <ProfilesContext.Provider
            value={{
                initProfiles,
                activatedProfileName,
                profiles,
            }}
        >
            {children}
        </ProfilesContext.Provider>
    );
};

/**
 *
 */
const useProfiles = () => useContext(ProfilesContext);

export {useProfiles};
export default ProfilesContextProvider;
