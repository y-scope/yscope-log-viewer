import {
    lazy,
    Suspense,
} from "react";

import {CircularProgress} from "@mui/joy";

import "./EditorLoader.css";


const Editor = lazy(() => import("."));

/**
 * Lazy-loaded wrapper for the Editor component. Displays a loading spinner
 * while the Editor chunk is being loaded.
 *
 * @return
 */
const EditorLoader = () => {
    return (
        <Suspense
            fallback={
                <div className={"editor-loading"}>
                    <CircularProgress/>
                </div>
            }
        >
            <Editor/>
        </Suspense>
    );
};

export default EditorLoader;
