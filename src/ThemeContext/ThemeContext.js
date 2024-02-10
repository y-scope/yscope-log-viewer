import React, {
    createContext, useEffect, useState
} from "react";

import PropTypes from "prop-types";

import LOCAL_STORAGE_KEYS from "../Viewer/services/LOCAL_STORAGE_KEYS";
import {THEME_NAMES} from "./constants";


const DEFAULT_THEME_NAME = THEME_NAMES.DARK;

const ThemeContext = createContext(DEFAULT_THEME_NAME);

/**
 * Provides a theme context for its children components.
 *
 * @param {React.ReactNode} children
 * @return {JSX.Element}
 */
const ThemeContextProvider = ({children}) => {
    const [theme, setTheme] = useState(DEFAULT_THEME_NAME);

    const changeTheme = (newTheme) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.UI_THEME, newTheme);
        document.getElementById("app").setAttribute("data-theme", newTheme);
        setTheme(newTheme);
    };

    useEffect(() => {
        const lsTheme =
            localStorage.getItem(LOCAL_STORAGE_KEYS.UI_THEME) || DEFAULT_THEME_NAME;

        if (null !== lsTheme) {
            changeTheme(lsTheme);
        }
    }, []);

    return (
        <ThemeContext.Provider
            value={{
                changeTheme,
                theme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

ThemeContextProvider.propTypes = {
    children: PropTypes.node,
};

export {ThemeContext, ThemeContextProvider};
