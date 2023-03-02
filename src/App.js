import React, {useEffect, useState} from "react";

import config from "./config.json";
import {DropFile} from "./DropFile/DropFile";
import {THEME_STATES} from "./ThemeContext/THEME_STATES";
import {ThemeContext} from "./ThemeContext/ThemeContext";
import VerbatimURLParams from "./Viewer/services/VerbatimURLParams";
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

    const [appMode, setAppMode] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [logEventIdx, setLogEventIdx] = useState(null);
    const [prettify, setPrettify] = useState(null);
    const [theme, setTheme] = useState(THEME_STATES.DARK);

    useEffect(() => {
        console.debug("Version:", config.version);
        const lsTheme = localStorage.getItem("ui-theme");
        switchTheme(THEME_STATES.LIGHT === lsTheme ?THEME_STATES.LIGHT :THEME_STATES.DARK);
        init();
    }, []);

    const switchTheme = (theme) => {
        localStorage.setItem("ui-theme", theme);
        document.getElementById("app").setAttribute("data-theme", theme);
        setTheme(theme);
    };

    /**
     * Initializes the application's state. The file to load is set based on
     * this order of precedence:
     * <ul>
     *   <li>`filePath` from url if it is provided</li>
     *   <li>`defaultFileUrl` if it is provided in config file</li>
     * </ul>
     * If neither are provided, we display a prompt to load a file.
     */
    const init = () => {
        const urlHashParams = new VerbatimURLParams(window.location.hash, "#");
        const urlSearchParams = new VerbatimURLParams(window.location.search, "?");

        // Load the initial state of the viewer from url
        setPrettify(urlSearchParams.get("prettify") === "true");
        setLogEventIdx(urlHashParams.get("logEventIdx"));

        const filePath = urlSearchParams.get("filePath");
        if (undefined !== filePath) {
            setFileInfo(filePath);
            setAppMode(APP_STATE.FILE_VIEW);
        } else {
            if (null !== config.defaultFileUrl) {
                setFileInfo(config.defaultFileUrl);
                setAppMode(APP_STATE.FILE_VIEW);
            } else {
                setAppMode(APP_STATE.FILE_PROMPT);
            }
        }
    };

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
                    {(APP_STATE.FILE_VIEW === appMode) &&
                        <Viewer logEventNumber={logEventIdx}
                            prettifyLog={prettify}
                            fileInfo={fileInfo}/>
                    }
                </DropFile>
            </ThemeContext.Provider>
        </div>
    );
}
