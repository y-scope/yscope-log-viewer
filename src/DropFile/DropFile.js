import React, {useContext, useEffect, useRef, useState} from "react";

import PropTypes, {oneOfType} from "prop-types";
import {Row} from "react-bootstrap";
import {FileEarmarkText} from "react-bootstrap-icons";
import ReactDOMServer from "react-dom/server";

import {ThemeContext} from "../ThemeContext/ThemeContext";

import "./DropFile.scss";

DropFile.propTypes = {
    children: oneOfType([PropTypes.array, PropTypes.bool, PropTypes.object]),
    handleFileDrop: PropTypes.func,
};

/**
 * Callback for when a file is dropped on the element
 * @callback FileDropCallback
 * @param {File} file
 */

/**
 * A container element to add drag & drop functionality to the child elements.
 * @param {JSX.Element[]} children Child elements
 * @param {FileDropCallback} handleFileDrop Handler for a file being dropped on
 * the child elements.
 * @return {JSX.Element}
 */
export function DropFile ({children, handleFileDrop}) {
    const {theme} = useContext(ThemeContext);

    const [hasChildren, setHasChildren] = useState(false);
    const [dragging, setDragging] = useState(false);

    const selectFileEl = useRef();

    useEffect(() => {
        // Indicates if this component has any children
        // TODO Check if the child element is a Viewer component
        setHasChildren(Boolean(ReactDOMServer.renderToStaticMarkup(children)));
    }, [children]);

    /**
     * Handler for a drag event
     *
     * @param {DragEvent} e
     */
    const handleDrag = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if ("dragenter" === e.type || "dragover" === e.type) {
            setDragging(true);
        } else if ("dragleave" === e.type) {
            setDragging(false);
        }
    };

    /**
     * Handler for a drop event. handleFileDrop callback is used
     * to load the dropped file into the viewer.
     *
     * @param {DragEvent} e
     */
    const handleDrop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (e.dataTransfer.files.length > 0 && e.dataTransfer.files[0]) {
            handleFileDrop(e.dataTransfer.files[0]);
        }
    };

    /**
     * Triggers the file input dialog when selectFileEl is clicked
     */
    const openFile = () => {
        selectFileEl.current.click();
    };

    /**
     * Callback once file is selected from file input dialog
     * @param {File} e
     */
    const loadFile = (e) => {
        handleFileDrop(e.target.files[0]);
    };


    /**
     * Returns JSX to be rendered if there are no child components to allow
     * the user to load a file.
     *
     * @return {JSX.Element}
     */
    const getLoadFileJSX = () => {
        return (
            <div data-theme={theme} className="upload-wrapper">
                <h3 className="heading">Log Viewer</h3>
                <div className="upload-container">
                    <FileEarmarkText size={"100px"} className="pb-4"/>
                    <Row className="text-center d-flex flex-column">
                        <input ref={selectFileEl} type="file" onChange={loadFile}
                            className="visually-hidden"/>
                        <a onClick={openFile} className="text-center" href="#">
                            Select Log File
                        </a>
                        <span>or</span>
                        <span>Drag and Drop File</span>
                    </Row>
                </div>
            </div>
        );
    };

    return (
        <div className="drag-container" onDragEnter={handleDrag}>
            {dragging &&
                <>
                    <div className="drag-wrapper">
                        <FileEarmarkText size={"50px"}/>
                        <h3 className="ms-3">Drop File to View</h3>
                    </div>
                    <div
                        className="drop-container"
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    />
                </>
            }
            {hasChildren
                ? <>{children}</>
                : <>{getLoadFileJSX()}</>
            }
        </div>
    );
}
