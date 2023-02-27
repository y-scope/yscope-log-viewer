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

    const urlSearchParams = new URLSearchParams(window.location.search, "?");

    const [fileInfo, setFileInfo] = useState(null);
    const [theme, setTheme] = useState(THEME_STATES.DARK);
    const [appMode, setAppMode] = useState();

    const switchTheme = (theme) => {
        localStorage.setItem("ui-theme", theme);
        document.getElementById("app").setAttribute("data-theme", theme);
        setTheme(theme);
    };

    const handleFileChange = (file) => {
        setFileInfo(file);
        setAppMode(APP_STATE.FILE_VIEW);
    };
    
    useEffect(() => {
        console.debug("Version:", config.version);
        const lsTheme = localStorage.getItem("ui-theme");
        switchTheme(lsTheme === THEME_STATES.LIGHT ? THEME_STATES.LIGHT : THEME_STATES.DARK);
        if (urlSearchParams.get("filePath")) {
            setFileInfo(urlSearchParams.get("filePath"));
            setAppMode(APP_STATE.FILE_VIEW);
        } else {
            setAppMode(APP_STATE.FILE_PROMPT);
        }
    }, []);

    return (
        <div id="app">
            <ThemeContext.Provider value={{theme, switchTheme}}>
                <DropFile handleFileDrop={handleFileChange}>
                    {appMode === APP_STATE.VIEWER &&
                        <Viewer logEventNumber={urlSearchParams.get("logEventIdx")}
                            prettifyLog={urlSearchParams.get("prettify") === "true"}
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
