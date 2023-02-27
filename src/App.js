import React, {useEffect, useState} from "react";

import config from "./config.json";
import {DropFile} from "./DropFile/DropFile";
import {THEME_STATES} from "./ThemeContext/THEME_STATES";
import {ThemeContext} from "./ThemeContext/ThemeContext";
import {Viewer} from "./Viewer/Viewer";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";

/**
 * Main component which renders viewer and scanner depending
 * on the state of the application.
 *
 * @return {JSX.Element}
 * @constructor
 */
export function App () {
    const APP_STATE = {
        FILE_PROMPT: 0,
        FILE_VIEW: 1,
    };

    const urlSearchParams = new URLSearchParams(window.location.search, "?");

    const [fileInfo, setFileInfo] = useState(null);
    const [theme, setTheme] = useState(THEME_STATES.DARK);
    const [appMode, setAppMode] = useState(null);

    const switchTheme = (theme) => {
        localStorage.setItem("ui-theme", theme);
        document.getElementById("app").setAttribute("data-theme", theme);
        setTheme(theme);
    };

    useEffect(() => {
        console.debug("Version:", config.version);
        const lsTheme = localStorage.getItem("ui-theme");
        switchTheme(lsTheme === THEME_STATES.LIGHT?THEME_STATES.LIGHT:THEME_STATES.DARK);
        if (urlSearchParams.get("filePath")) {
            setFileInfo(urlSearchParams.get("filePath"));
            setAppMode(APP_STATE.FILE_VIEW);
        } else {
            setAppMode(APP_STATE.FILE_PROMPT);
        }
    }, []);

    /**
     * Handles the file being changed
     * @param {File} file
     */
    const handleFileChange = (file) => {
        setFileInfo(file);
        setAppMode(APP_STATE.FILE_VIEW);
    };

    return (
        <div id="app">
            <ThemeContext.Provider value={{theme, switchTheme}}>
                <DropFile handleFileDrop={handleFileChange}>
                    {appMode === APP_STATE.FILE_VIEW &&
                        <Viewer logEventNumber={urlSearchParams.get("logEventIdx")}
                            prettifyLog={urlSearchParams.get("prettify") === "true"}
                            fileInfo={fileInfo}/>
                    }
                </DropFile>
            </ThemeContext.Provider>
        </div>
    );
}
