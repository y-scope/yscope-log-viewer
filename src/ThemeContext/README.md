# ThemeContext

Exposes a provider which can wrap any YScope React component to manage themes.

# Usage 

The sample application provided below demonstrates the configuration needed to 
deploy the log viewer with drag&drop and theming using the Theme Context.

```js
import React, {useState} from 'react';
import reactDom from 'react-dom';
import {DropFile} from "./DropFile/DropFile";
import {ThemeContextProvider} from "./ThemeContext/ThemeContext";
import {Viewer} from "./Viewer/Viewer";

import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
    const APP_STATE = {
        FILE_PROMPT: 0,
        FILE_VIEW: 1,
    };

    const [fileInfo, setFileInfo] = useState(null);
    const [appMode, setAppMode] = useState();

    const handleFileChange = (file) => {
        setFileInfo(file);
        setAppMode(APP_STATE.FILE_VIEW);
    };
    
    useEffect(() => {
        console.debug("Version:", config.version);
        setAppMode(APP_STATE.FILE_PROMPT);
    }, []);

    return (
        <div id="app">
            <ThemeContextProvider>
                <DropFile handleFileDrop={handleFileChange}>
                    {appMode === APP_STATE.VIEWER &&
                        <Viewer logEventNumber={333}
                            prettifyLog={true}
                            fileInfo={fileInfo}/>
                    }
                </DropFile>
            </ThemeContextProvider>
        </div>
    );
}

reactDom.render(<App/>, document.getElementById("root"));

```
