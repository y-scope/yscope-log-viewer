import React, {
    createContext, useEffect, useState
} from "react";

import PropTypes from "prop-types";

import LOCAL_STORAGE_KEYS from "../Viewer/services/LOCAL_STORAGE_KEYS";
import {THEME_NAMES} from "./constants";


/**
 * A default theme name from the predefined THEME_NAMES.
 * @type {string}
 */
const DEFAULT_THEME_NAME = THEME_NAMES.DARK;

const ThemeContext = createContext(DEFAULT_THEME_NAME);

/**
 * Provides a theme context for its child components
 * and manages the theme state.
 *
 * @param {React.ReactNode} children
 * @return {JSX.Element}
 */
const ThemeContextProvider = ({children}) => {
    const [theme, setTheme] = useState(DEFAULT_THEME_NAME);

    useEffect(() => {
        const lsTheme =
            localStorage.getItem(LOCAL_STORAGE_KEYS.UI_THEME) || DEFAULT_THEME_NAME;
        if (null !== lsTheme) {
            changeTheme(lsTheme);
        }
    }, []);

    /**
     * Sets the theme for the application.
     *
     * @param {string} themeName one of the predefined THEME_NAMES
     */
    const changeTheme = (themeName) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.UI_THEME, themeName);
        setTheme(themeName);
    };

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
