# DropFile

`DropFile` is a React component that wraps around any component and can be used
to accept files that have been dropped into the browser. `DropFile` accepts a
callback function which is invoked when a file is received and passes the `File`
object that can be used as needed. The drag and drop UI will overlay all the
child components.

# Usage

The sample application provided below demonstrates a simple use case for this 
component.

```shell
import React, {useState} from "react";
import reactDom from "react-dom";
import {DropFile} from "./DropFile/DropFile";

import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
    const [fileInfo, setFileInfo] = useState(null);

    const handleFileChange = (file) => {
        setFileInfo(file);
    };

    return (
        <div id="app">
            <DropFile handleFileDrop={handleFileChange}>
                <CustomComponent fileInfo={fileInfo}>
            </DropFile>
        </div>
    );
}

reactDom.render(<App/>, document.getElementById("root"));

```
