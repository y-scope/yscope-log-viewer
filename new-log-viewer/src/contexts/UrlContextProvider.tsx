import React, {
    createContext,
    useEffect,
    useState,
} from "react";


interface UrlContextType {
    setSearchParamSet: (searchParamSet: Record<string, string | null>) => void;
    setHashParamSet: (hashParamSet: Record<string, string | null>) => void;
    copyToClipboard: (searchParamSet: Record<string, string | null>, hashParamSet: Record<string, string | null>) => void;
}

const UrlContext = createContext <UrlContextType>({} as UrlContextType);


interface UrlContextProviderProps {
    children: React.ReactNode
}

/**
 * Provides a context for managing URL parameters and hash values, including utilities for setting search and hash parameters, and copying the current URL with these parameters to the clipboard.
 *
 * @param children.children
 * @param children The child components that will have access to the context.
 */
const UrlContextProvider = ({children}: UrlContextProviderProps) => {
    const [hashParam, setHashParam] = useState<string>(window.location.hash.substring(1));
    useEffect(() => {
        setHashParam(window.location.hash.substring(1));
    }, [window.location.hash]);

    const setSearchParamSetHelper = (searchParamSet: Record<string, string | null>) => {
        const newSearchParam = new URLSearchParams(window.location.search.substring(1));
        const {filePath} = searchParamSet;
        delete searchParamSet.filePath;

        for (const [key, value] of Object.entries(searchParamSet)) {
            if (null === value) {
                newSearchParam.delete(key);
            } else {
                newSearchParam.set(key, value);
            }
        }
        if (filePath) {
            newSearchParam.set("filePath", filePath);
        }

        return newSearchParam;
    };

    const setSearchParamSet = (searchParamSet: Record<string, string | null>) => {
        const newUrl = new URL(window.location.href);
        newUrl.search = setSearchParamSetHelper(searchParamSet).toString();
        if (!(/%23|%26/).test(newUrl.search)) {
            newUrl.search = decodeURIComponent(newUrl.search);
        }
        window.history.pushState({}, "", newUrl.toString());
    };

    const setHashParamSetHelper = (hashParamSet: Record<string, string | null>) => {
        const newHashParam = new URLSearchParams(hashParam);
        for (const [key, value] of Object.entries(hashParamSet)) {
            if (null === value) {
                newHashParam.delete(key);
            } else {
                newHashParam.set(key, value);
            }
        }

        return newHashParam;
    };

    const setHashParamSet = (hashParamSet: Record<string, string | null>) => {
        const newUrl = new URL(window.location.href);
        newUrl.hash = setHashParamSetHelper(hashParamSet).toString();
        window.history.pushState({}, "", newUrl.toString());
    };

    const copyToClipboard = (searchParamSet: Record<string, string | null>, hashParamSet: Record<string, string | null>) => {
        const newUrl = new URL(window.location.href);
        newUrl.search = setSearchParamSetHelper(searchParamSet).toString();
        newUrl.hash = setHashParamSetHelper(hashParamSet).toString();
        navigator.clipboard.writeText(newUrl.toString())
            .then(() => {
                console.log("URL copied to clipboard.");
            })
            .catch((error: unknown) => {
                console.error("Failed to copy URL to clipboard:", error);
            });
    };

    return (
        <UrlContext.Provider value={{setSearchParamSet, setHashParamSet, copyToClipboard}}>
            {children}
        </UrlContext.Provider>
    );
};

export default UrlContextProvider;
export {UrlContext};
