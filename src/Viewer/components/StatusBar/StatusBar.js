import React, {useContext, useEffect, useState} from "react";

import PropTypes from "prop-types";
import {Braces, Filter, InfoCircle} from "react-bootstrap-icons";

import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import FourByteClpIrStreamReader from "../../services/decoder/FourByteClpIrStreamReader";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import {getModifiedUrl} from "../../services/utils";
import {StatusBarMenu} from "./StatusBarMenu/StatusBarMenu";

import "./StatusBar.scss";

StatusBar.propTypes = {
    status: PropTypes.string,
    logFileState: PropTypes.object,
    loadingLogs: PropTypes.bool,
    changeStateCallback: PropTypes.func,
};

/**
 * Callback used to change the parent component's state
 * @callback ChangeStateCallback
 * @param {string} type The type of state change ({@link STATE_CHANGE_TYPE})
 * @param {object} args Arguments used to update the state
 */

/**
 * Status bar of the viewer component. Contains the line number, column number,
 * verbosity/pretty-print selectors.
 * @param {string} status Status message to display in the status bar.
 * @param {object} logFileState Current state of the log file.
 * @param {boolean} loadingLogs Used to disable select when logs are loaded.
 * @param {ChangeStateCallback} changeStateCallback
 * @return {JSX.Element}
 */
export function StatusBar ({status, logFileState, loadingLogs, changeStateCallback}) {
    const [statusMessage, setStatusMessage] = useState("");
    const [statusEditor, setStatusEditor] = useState("");
    const {theme} = useContext(ThemeContext);

    useEffect(() => {
        setFooter();
    }, [logFileState]);

    useEffect(() => {
        setStatusMessage(status);
    }, [status]);

    /**
     * Sets the content of the footer and updates the URL to selected log event.
     */
    const setFooter = () => {
        const logEventIdx = logFileState.logEventIdx;
        const logEventMetadataLength = logFileState.numberOfEvents;

        let lineInfo = "";
        if (0 !== logEventIdx && logEventIdx) {
            lineInfo = `Log Event ${logEventIdx} of ${logEventMetadataLength}, `;
        }
        lineInfo += `Ln ${logFileState.lineNumber}, Col ${logFileState.columnNumber}`;
        setStatusEditor(lineInfo);

        // Update URL without firing onhashchange or adding to browser's history
        let url = `${window.location.origin}${window.location.pathname}${window.location.search}`;
        if (logEventIdx && 0 !== logEventIdx) {
            url += `#logEventIdx=${logEventIdx}`;
        }
        history.pushState(null, null, url);
    };

    /**
     * Generates link to currently highlighted log event.
     *
     * @return {string}
     */
    function generateLinkToLogEvent () {
        const hashParams = {
            logEventIdx: logFileState.logEventIdx,
        };

        return getModifiedUrl({}, hashParams);
    }

    /**
     * Copies the link to current log event to the clipboard
     */
    const copyLinkToLogEvent = () => {
        if (0 === Number(logFileState.logEventIdx)) {
            console.error("Copy link not supported: Cursor is not on a log event.");
            return;
        }
        const url = generateLinkToLogEvent();
        navigator.clipboard.writeText(url).then(function () {
            setStatusMessage("Copied link to log event.");
        }, function (err) {
            setStatusMessage(`Failed to copy link to log event: ${err}`);
        });
    };

    const getVerbosity = () => {
        return (logFileState.verbosity === -1)?"ALL":
            FourByteClpIrStreamReader.VERBOSITIES[logFileState.verbosity].label;
    };

    const selectVerbosity = (value) => {
        changeStateCallback(STATE_CHANGE_TYPE.verbosity, {"verbosity": value});
    };

    // TODO Set min size of viewer
    // TODO Add color for different levels
    // TODO Set the maximum size of the status message (replace with ellipses?)
    // TODO Rename all variables that include verbosity to level
    return (
        <div id="status-bar" data-theme={theme}>
            <div className="status-bar">
                <div className="status-left">
                    <div className="status-item">
                        { (statusMessage !== "") &&
                            <>
                                <InfoCircle className="viewer-icons"/>
                                <span className="ms-2">{statusMessage}</span>
                            </>
                        }
                    </div>
                </div>
                <div className="status-right ">
                    <button
                        className="status-item status-item-button"
                        onClick={copyLinkToLogEvent}
                        title="Click to copy direct link to event"
                    >{statusEditor}</button>
                    <StatusBarMenu
                        className="status-item status-item-button status-verbosity-accent"
                        disabled={loadingLogs}
                        setVerbosity={selectVerbosity}
                    >
                        <Filter/>
                        <span className="ms-2 me-3">{getVerbosity()}</span>
                    </StatusBarMenu>
                    <button
                        className="status-item status-item-button status-prettify-accent"
                        disabled={loadingLogs}
                        onClick={() => changeStateCallback(
                            STATE_CHANGE_TYPE.prettify, {prettify: !logFileState.prettify}
                        )}
                        title={logFileState.prettify?
                            "Disable pretty printing":
                            "Enable pretty printing"
                        }
                    >
                        <Braces className="me-1"/>
                        <span>
                            {logFileState.prettify?"Un-prettify":"Prettify"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
