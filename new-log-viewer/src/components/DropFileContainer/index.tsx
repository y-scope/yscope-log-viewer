import React, {
    useContext,
    useState,
} from "react";

import {StateContext} from "../../contexts/StateContextProvider";
import {
    LOAD_STATE,
    CURSOR_CODE
} from "../../typings/worker";

import "./index.css";


interface DropFileContextProviderProps {
    children: React.ReactNode;
}

/**
 * A container element to add drag & drop functionality to the child elements.
 *
 * @param props
 * @param props.children
 * @return
 */
const DropFileContainer = ({children}: DropFileContextProviderProps) => {
    const {loadFile, loadState} = useContext(StateContext);
    const [isFileHovering, setIsFileHovering] = useState(false);
    const isLoading = LOAD_STATE.LOADING_FILE === loadState || LOAD_STATE.EXPORTING === loadState;

    const handleDrag = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        ev.stopPropagation();

        if ("dragenter" === ev.type) {
            setIsFileHovering(true);
        } else if ("dragleave" === ev.type) {
            // Only stop the hover effect if the pointer leaves the bounding rectangle of the
            // DropFileContainer.
            //
            // NOTE: "dragleave" could get fired when the wrapped `children` receive focus. Setting
            // `pointer-events: none` on the children is viable but could cause the children to be
            // unresponsive. So instead, we use the solution below.
            const {bottom, left, right, top} = ev.currentTarget.getBoundingClientRect();
            if (ev.clientX >= left && ev.clientX <= right &&
                ev.clientY >= top && ev.clientY <= bottom) {
                return;
            }

            setIsFileHovering(false);
        }
    };

    const handleDrop = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        ev.stopPropagation();

        setIsFileHovering(false);
        if (isLoading) {
            return;
        }

        const [file] = ev.dataTransfer.files;
        if ("undefined" === typeof file) {
            console.warn("No file dropped.");

            return;
        }
        loadFile(file, {code: CURSOR_CODE.LAST_EVENT, args: null});
    };

    return (
        <div
            className={"drop-file-container"}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div onDrop={handleDrop}>
                {children}
                {isFileHovering && (
                    <div
                        className={"hover-mask"}
                        onDrop={handleDrop}
                    >
                        <div
                            className={`hover-message ${isLoading ?
                                "hover-message-loading" :
                                ""}`}
                            onDrop={handleDrop}
                        >
                            {isLoading ?
                                "Drop is disabled during loading" :
                                "Drop file to view"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DropFileContainer;
