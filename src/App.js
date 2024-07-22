import React, {useEffect, useState} from "react";

import config from "./config.json";
import {DropFile} from "./DropFile/DropFile";
import {ThemeContextProvider} from "./ThemeContext/ThemeContext";
import {getAbsoluteUrl} from "./Viewer/services/utils";
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
    const [timestamp, setTimestamp] = useState(null);
    const [prettify, setPrettify] = useState(null);

    useEffect(() => {
        console.debug("Version:", config.version);
        init();
    }, []);

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
        const urlSearchParams = new URLSearchParams(window.location.search.substring(1));
        const urlHashParams = new URLSearchParams(window.location.hash.substring(1));

        // Load the initial state of the viewer from url
        setPrettify(urlSearchParams.get("prettify") === "true");
        setLogEventIdx(urlHashParams.get("logEventIdx"));
        setTimestamp(urlSearchParams.get("timestamp"));

        const filePath = urlSearchParams.get("filePath");
        if (null !== filePath) {
            const absoluteUrl = getAbsoluteUrl(filePath);
            setFileInfo(absoluteUrl);
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
            <ThemeContextProvider>
                <DropFile handleFileDrop={handleFileChange}>
                    {(APP_STATE.FILE_VIEW === appMode) &&
                        <Viewer logEventNumber={logEventIdx}
                            timestamp={timestamp}
                            prettifyLog={prettify}
                            fileInfo={fileInfo}/>
                    }
                </DropFile>
            </ThemeContextProvider>
        </div>
    );
}
