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

    const [fileInfo, setFileInfo] = useState(null);
    const [theme, setTheme] = useState(THEME_STATES.DARK);
    const [appMode, setAppMode] = useState(null);
    const [prettify, setPrettify] = useState(null);
    const [logEventIdx, setLogEventIdx] = useState(null);

    const switchTheme = (theme) => {
        localStorage.setItem("ui-theme", theme);
        document.getElementById("app").setAttribute("data-theme", theme);
        setTheme(theme);
    };

    /**
     * Loads the initial state of the viewer from url arguments.
     *
     * ### Example:
     * localhost:3010/?filePath=/logs/sample.clp.zst&prettify=true&logEventIdx=1
     *
     * @return {[string,boolean,string]} [filePath,prettify,logEventIdx]
     */
    const getInitialStateFormUrl = () => {
        const urlSearchParams = new URLSearchParams(window.location.search, "?");
        const hash = window.location.hash;
        const filePath = urlSearchParams.get("filePath");
        const prettify = urlSearchParams.get("prettify") === "true";
        const logEventIdx = (hash.includes("logEventIdx") ?hash.split("=").pop():null);
        return [filePath, prettify, logEventIdx];
    };

    /**
     * Load the file when app is rendered in this order of precedence:
     * - Default file url is used if it is provided in config file.
     * - File path from url if it is provided.
     * - Provide prompt to load file.
     */
    const loadFileOnLoad = () => {
        const [filePath, prettify, logEventIdx] = getInitialStateFormUrl();
        setPrettify(prettify);
        setLogEventIdx(logEventIdx);

        if (config.defaultFileUrl) {
            setFileInfo(config.defaultFileUrl);
            setAppMode(APP_STATE.FILE_VIEW);
        } else {
            if (filePath) {
                setFileInfo(filePath);
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

    useEffect(() => {
        console.debug("Version:", config.version);
        const lsTheme = localStorage.getItem("ui-theme");
        switchTheme(lsTheme === THEME_STATES.LIGHT?THEME_STATES.LIGHT:THEME_STATES.DARK);
        loadFileOnLoad();
    }, []);

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
