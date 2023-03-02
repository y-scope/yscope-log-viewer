# Viewer

Viewer is a React component that can be used to view Zstd-compressed 
[CLP](https://github.com/y-scope/clp) IR stream log files. The viewer enables 
the following features:

* Decompressing and decoding Zstd-compressed CLP IR stream log files.
* Pagination to view large files in the browser without reaching memory limits.
* Filtering by log level.
* Pretty printing log events.
* Linking to specific log events within the log file. 

# Usage

The sample application provided below demonstrates the configuration needed to 
deploy the log viewer with drag & drop functionality and theming. This 
application is also able to load file paths, prettify state, and the initial log
event number from the url.

### Example:
`http://localhost:3010/?filePath=/logs/custom_app/high-compression-ratio-log.clp.zst&prettify=true&logEventIdx=100`
```shell
import React, { useState } from 'react';
import reactDom from 'react-dom';
import {DropFile} from "./DropFile/DropFile";
import {THEME_STATES} from "./ThemeContext/THEME_STATES";
import {ThemeContext} from "./ThemeContext/ThemeContext";
import {Viewer} from "./Viewer/Viewer";

import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
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
     * Initializes the applications state. The file to load is set based on
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
        console.log(filePath);
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

reactDom.render(<App/>, document.getElementById("root"));

```

# Webpack Configuration

To build the viewer with webpack, include the following in your build
configuration.

```shell
resolve: {
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
            "path": false,
            "fs": false,
        }
    }
```
