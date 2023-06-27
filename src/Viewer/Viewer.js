import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import PropTypes, {oneOfType} from "prop-types";
import {Row} from "react-bootstrap";
import LoadingIcons from "react-loading-icons";

import {THEME_STATES} from "../ThemeContext/THEME_STATES";
import {ThemeContext} from "../ThemeContext/ThemeContext";
import {MenuBar} from "./components/MenuBar/MenuBar";
import MonacoInstance from "./components/Monaco/MonacoInstance";
import {StatusBar} from "./components/StatusBar/StatusBar";
import CLP_WORKER_PROTOCOL from "./services/CLP_WORKER_PROTOCOL";
import FourByteClpIrStreamReader from "./services/decoder/FourByteClpIrStreamReader";
import MessageLogger from "./services/MessageLogger";
import STATE_CHANGE_TYPE from "./services/STATE_CHANGE_TYPE";
import {isNumeric, modifyFileMetadata, modifyPage} from "./services/utils";
import VerbatimURLParams from "./services/VerbatimURLParams";

import "./Viewer.scss";

Viewer.propTypes = {
    fileInfo: oneOfType([PropTypes.object, PropTypes.string]),
    filePath: PropTypes.string,
    prettifyLog: PropTypes.bool,
    logEventNumber: PropTypes.string,
    timestamp: PropTypes.string,
};

/**
 * Contains the menu, Monaco editor, and status bar. Viewer spawns its own
 * worker to manage the file and perform CLP operations.
 * @param {File|String} fileInfo File object to read or file path to load
 * @param {boolean} prettifyLog Whether to prettify the log file
 * @param {Number} logEventNumber The initial log event number
 * @param {Number} timestamp The initial timestamp to show. If this field is
 * valid, logEventNumber will be ignored.
 * @return {JSX.Element}
 */
export function Viewer ({fileInfo, prettifyLog, logEventNumber, timestamp}) {
    const {theme} = useContext(ThemeContext);

    // Ref hook used to reference worker used for loading and decoding
    const clpWorker = useRef(null);

    // Logger used to track of all loading messages and state transitions
    const msgLogger = useRef(new MessageLogger());

    // Callbacks for adding and clearing folding ranges
    const addFolding = useRef(undefined);
    const resetFolding = useRef(undefined);

    // Loading States
    const [loadingFile, setLoadingFile] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusMessageLogs, setStatusMessageLogs] = useState([]);

    // Log States
    const lsPageSize = localStorage.getItem("pageSize");
    const [logFileState, setLogFileState] = useState({
        pageSize: lsPageSize ? Number(lsPageSize) : 10000,
        pages: null,
        page: null,
        prettify: prettifyLog ? prettifyLog : false,
        logEventIdx: isNumeric(logEventNumber) ? Number(logEventNumber) : null,
        lineNumber: null,
        columnNumber: null,
        colNumber: null,
        numberOfEvents: null,
        verbosity: null,
    });
    const [fileMetadata, setFileMetadata] = useState(null);
    const [logData, setLogData] = useState("");

    useEffect(() => {
        // Cleanup
        return () => {
            if (clpWorker.current) {
                clpWorker.current.terminate();
            }
        };
    }, []);

    /**
     * Reload viewer on fileInfo change
     * @param {File|string} fileInfo
     */
    const loadFile = (fileInfo) => {
        if (clpWorker.current) {
            clpWorker.current.terminate();
        }
        setStatusMessageLogs([...msgLogger.current.reset()]);
        setLoadingLogs(false);
        setLoadingFile(true);

        // Create new worker and pass args to worker to load file
        clpWorker.current = new Worker(new URL("./services/clpWorker.js", import.meta.url));
        clpWorker.current.onmessage = handleWorkerMessage;
        // If file was loaded using file dialog or drag/drop, reset logEventIdx
        const logEvent = (typeof fileInfo === "string") ? logFileState.logEventIdx : null;
        const initialTimestamp = isNumeric(timestamp) ? Number(timestamp) : null;
        clpWorker.current.postMessage({
            code: CLP_WORKER_PROTOCOL.LOAD_FILE,
            fileInfo: fileInfo,
            prettify: logFileState.prettify,
            logEventIdx: logEvent,
            initialTimestamp: initialTimestamp,
            pageSize: logFileState.pageSize,
        });
    };

    // Load file if file info changes (this could happen from drag and drop)
    useEffect(() => {
        loadFile(fileInfo);
    }, [fileInfo]);

    // Save statusMessages to the msg logger for debugging
    useEffect(() => {
        msgLogger.current.add(statusMessage);
    }, [statusMessage]);

    /**
     * Passes state changes to the worker. Worker performs operation
     * and returns an updated state which is used to update the UI.
     * @param {string} type The type of state change to execute.
     * @param {object} args The argument used to execute state change.
     */
    const changeState = useCallback((type, args) => {
        if (loadingLogs) {
            return;
        }
        switch (type) {
            case STATE_CHANGE_TYPE.page:
                const [linePos, validNewPage] = modifyPage(args.action, logFileState.page,
                    args.requestedPage, logFileState.pages);
                if (validNewPage) {
                    setLoadingLogs(true);
                    setStatusMessage(`Loading page number ${validNewPage}...`);
                    clpWorker.current.postMessage({
                        code: CLP_WORKER_PROTOCOL.CHANGE_PAGE,
                        page: validNewPage,
                        linePos: linePos,
                    });
                }
                break;
            case STATE_CHANGE_TYPE.verbosity:
                if (args.verbosity !== logFileState.verbosity) {
                    setLoadingLogs(true);
                    const verbosity = (args.verbosity === -1) ? "ALL"
                        : FourByteClpIrStreamReader.VERBOSITIES[args.verbosity].label;
                    setStatusMessage(`Filtering logs with level: ${verbosity}`);
                    clpWorker.current.postMessage({
                        code: CLP_WORKER_PROTOCOL.UPDATE_VERBOSITY,
                        verbosity: args.verbosity,
                    });
                }
                break;
            case STATE_CHANGE_TYPE.pageSize:
                setLoadingLogs(true);
                setStatusMessage(`Changing events per page to ${args.pageSize}`);
                clpWorker.current.postMessage({
                    code: CLP_WORKER_PROTOCOL.REDRAW_PAGE,
                    pageSize: Number(args.pageSize),
                });
                break;
            case STATE_CHANGE_TYPE.prettify:
                setLoadingLogs(true);
                setStatusMessage(args.prettify ? "Prettifying..." : "Un-prettifying...");
                clpWorker.current.postMessage({
                    code: CLP_WORKER_PROTOCOL.PRETTY_PRINT,
                    prettify: args.prettify,
                });
                break;
            case STATE_CHANGE_TYPE.lineNumber:
                clpWorker.current.postMessage({
                    code: CLP_WORKER_PROTOCOL.GET_EVENT_FROM_LINE,
                    lineNumber: args.lineNumber,
                    columnNumber: args.columnNumber,
                });
                break;
            case STATE_CHANGE_TYPE.logEventIdx:
                setLoadingLogs(true);
                setStatusMessage(`Going to new log event ${args.logEventIdx}`);
                clpWorker.current.postMessage({
                    code: CLP_WORKER_PROTOCOL.GET_LINE_FROM_EVENT,
                    desiredLogEventIdx: args.logEventIdx,
                });
                break;
            case STATE_CHANGE_TYPE.collapse:
                addFolding.current = args.callback.addFolding;
                resetFolding.current = args.callback.resetFolding;
                clpWorker.current.postMessage({
                    code: CLP_WORKER_PROTOCOL.GET_SIMILAR_LINES,
                    lineNumber: args.lineNumber,
                })
                break;
            default:
                break;
        }
    }, [logFileState, loadingLogs]);

    /**
     * Handles messages sent from clpWorker and updates the
     * relevant component states
     * @param {object} event
     */
    const handleWorkerMessage = useCallback((event) => {
        switch (event.data.code) {
            case CLP_WORKER_PROTOCOL.LOADING_MESSAGES:
                msgLogger.current.add(event.data.status, event.data.error);
                setStatusMessageLogs([...msgLogger.current.get()]);
                break;
            case CLP_WORKER_PROTOCOL.ERROR:
                msgLogger.current.add(event.data.error);
                setStatusMessageLogs([...msgLogger.current.get()]);
                setStatusMessage(event.data.error);
                setLoadingFile(false);
                setLoadingLogs(false);
                break;
            case CLP_WORKER_PROTOCOL.UPDATE_STATE:
                setLogFileState({
                    ...logFileState,
                    ...event.data.state,
                });
                setLoadingFile(false);
                setLoadingLogs(false);
                setStatusMessage("");
                break;
            case CLP_WORKER_PROTOCOL.LOAD_LOGS:
                if (resetFolding.current !== undefined) {
                    resetFolding.current();
                }
                setLogData(event.data.logs);
                setLoadingLogs(false);
                setStatusMessage("");
                break;
            case CLP_WORKER_PROTOCOL.UPDATE_FILE_INFO:
                setFileMetadata(event.data.fileState);
                break;
            case CLP_WORKER_PROTOCOL.GET_SIMILAR_LINES:
                if (addFolding.current !== undefined) {
                    addFolding.current(event.data.state.range);
                }
                break;
            default:
                break;
        }
    }, [logFileState, logData]);

    useEffect(() => {
        modifyFileMetadata(fileMetadata, logFileState.logEventIdx);
    }, [fileMetadata]);

    // Fires when hash is changed in the window.
    window.onhashchange = () => {
        const urlHashParams = new VerbatimURLParams(window.location.hash, "#");
        const logEventIdx = urlHashParams.get("logEventIdx");
        if (isNumeric(logEventIdx)) {
            changeState(STATE_CHANGE_TYPE.logEventIdx, {logEventIdx: Number(logEventIdx)});
        } else {
            changeState(STATE_CHANGE_TYPE.logEventIdx, {logEventIdx: logFileState.logEventIdx});
        }
    };

    return (
        <div data-theme={theme} className="viewer-container">
            {loadingFile &&
                <div className="viewer-loading-container">
                    <Row className="m-0">
                        <LoadingIcons.Oval height="5em" stroke={
                            (THEME_STATES.LIGHT === theme) ? "black" : "white"
                        }/>
                    </Row>
                    <Row className="loading-container">
                        <ul>
                            {statusMessageLogs.map((status, index) =>
                                <li key={index}>{status}</li>
                            )}
                        </ul>
                    </Row>
                </div>
            }
            {false === loadingFile &&
                <div className="d-flex h-100 flex-column">
                    <MenuBar
                        loadingLogs={loadingLogs}
                        fileMetaData={fileMetadata}
                        logFileState={logFileState}
                        changeStateCallback={changeState}
                        loadFileCallback={loadFile}/>

                    <div className="flex-fill h-100 overflow-hidden">
                        <MonacoInstance
                            logData={logData}
                            loadingLogs={loadingLogs}
                            changeStateCallback={changeState}
                            logFileState={logFileState}/>
                    </div>

                    <StatusBar
                        status={statusMessage}
                        logFileState={logFileState}
                        loadingLogs={loadingLogs}
                        changeStateCallback={changeState}/>
                </div>
            }
        </div>
    );
}
