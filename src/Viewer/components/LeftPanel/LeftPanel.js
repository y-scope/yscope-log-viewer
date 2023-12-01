import React, {useCallback, useContext, useRef, useState} from "react";

import PropTypes from "prop-types";
import {Button, Form, Modal} from "react-bootstrap";
import {Folder, Gear, Moon, Search, Sun} from "react-bootstrap-icons";

import {THEME_STATES} from "../../../ThemeContext/THEME_STATES";
import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import {ResizeHandle} from "../ResizeHandle/ResizeHandle";

import "./LeftPanel.scss";

const LEFT_PANEL_WIDTH_LIMIT_FACTOR = 0.8;
const LEFT_PANEL_SNAP_WIDTH = 20;
const LEFT_PANEL_DEFAULT_WIDTH_FACTOR = 0.2;

LeftPanel.propTypes = {
    logFileState: PropTypes.object,
    panelWidth: PropTypes.number,
    setPanelWidth: PropTypes.func,
    activeTabId: PropTypes.number,
    setActiveTabId: PropTypes.func,
    loadFileCallback: PropTypes.func,
    changeStateCallback: PropTypes.func,
    children: PropTypes.element,
};

/**
 * Callback used to set the panel's width
 * @callback SetPanelWidth
 * @param {number} width
 */

/**
 * Callback used to set the ID of the active tab
 * @callback SetActiveTabId
 * @param {number} id
 */

/**
 * This callback is used to load a new file.
 *
 * @callback LoadFileCallback
 * @param {File|String} fileInfo File object or file path to load.
 */

/**
 * Callback used to change the parent component's state
 * @callback ChangeStateCallback
 * @param {string} type The type of state change ({@link STATE_CHANGE_TYPE})
 * @param {object} args Arguments used to update the state
 */

/**
 * The left panel component
 * @param {object} logFileState Current state of the log file
 * @param {number} panelWidth
 * @param {SetPanelWidth} setPanelWidth
 * @param {number} activeTabId
 * @param {SetActiveTabId} setActiveTabId
 * @param {LoadFileCallback} loadFileCallback
 * @param {ChangeStateCallback} changeStateCallback
 * @param {JSX.Element} children
 * @return {JSX.Element}
 */
export function LeftPanel ({
    logFileState,
    panelWidth,
    setPanelWidth,
    activeTabId,
    setActiveTabId,
    loadFileCallback,
    changeStateCallback,
    children,
}) {
    const handleLeftPanelResize = useCallback((newWidth) => {
        setPanelWidth((prev) => {
            // limit search panel width
            if (newWidth > window.innerWidth * LEFT_PANEL_WIDTH_LIMIT_FACTOR) {
                return prev;
            }
            // get panel to snap if it gets too small
            if (newWidth < LEFT_PANEL_SNAP_WIDTH) {
                return 0;
            }

            return newWidth;
        });
    }, []);

    const togglePanel = (activeTabId) => {
        setActiveTabId(activeTabId);
        setPanelWidth((prev) => {
            if (prev > 0) {
                // if previously opened, hide panel
                return 0;
            } else {
                // if previously not opened, open panel
                return window.innerWidth * LEFT_PANEL_DEFAULT_WIDTH_FACTOR;
            }
        });
    };

    return (
        <>
            <LeftPanelTabs
                logFileState={logFileState}
                activeTabId={panelWidth > 0 ? activeTabId : -1}
                togglePanel={togglePanel}
                loadFileCallback={loadFileCallback}
                changeStateCallback={changeStateCallback}
            />
            <div className={"left-panel-container"}>
                <div className={"left-panel-content-container"} style={{
                    minWidth: panelWidth,
                    width: panelWidth,
                }}>
                    {children}
                </div>
                <ResizeHandle resizeCallback={handleLeftPanelResize}/>
            </div>
        </>
    );
}

LeftPanelTabs.propTypes = {
    logFileState: PropTypes.object,
    activeTabId: PropTypes.number,
    togglePanel: PropTypes.func,
    loadFileCallback: PropTypes.func,
    changeStateCallback: PropTypes.func,
};

/**
 * Callback used to toggle (open/close) the panel
 * @callback TogglePanel
 * @param {number} activeTabId
 */

/**
 * This callback is used to load a new file.
 *
 * @callback LoadFileCallback
 * @param {File|String} fileInfo File object or file path to load.
 */

/**
 * Callback used to change the parent component's state
 * @callback ChangeStateCallback
 * @param {string} type The type of state change ({@link STATE_CHANGE_TYPE})
 * @param {object} args Arguments used to update the state
 */

/**
 * The tabs of the left panel
 * @param {object} logFileState Current state of the log file
 * @param {number} activeTabId
 * @param {TogglePanel} togglePanel
 * @param {LoadFileCallback} loadFileCallback
 * @param {ChangeStateCallback} changeStateCallback
 * @return {JSX.Element}
 *
 */
function LeftPanelTabs ({
    logFileState,
    activeTabId,
    togglePanel,
    loadFileCallback,
    changeStateCallback,
}) {
    const {theme, switchTheme} = useContext(ThemeContext);

    const [showSettings, setShowSettings] = useState(false);
    const [eventsPerPage, setEventsPerPage] = useState(logFileState.pages);
    const inputFile = useRef(null);

    // Search Functions
    const toggleSearchPanel = () => {
        togglePanel(LEFT_PANEL_TAB_IDS.SEARCH);
    };

    // Settings Functions
    const handleCloseSettings = () => setShowSettings(false);
    const handleShowSettings = () => setShowSettings(true);

    // File functions
    const openFile = () => {
        inputFile.current.click();
    };

    const loadFile = (e) => {
        loadFileCallback(e.target.files[0]);
    };

    // Modal Functions
    const getModalClass = () => {
        return (THEME_STATES.LIGHT === theme)?"modal-light":"modal-dark";
    };

    const saveModalChanges = (e) => {
        // TODO Can't backspace 0 from the number input
        // TODO What is the maximum number of events monaco can support?
        e.preventDefault();
        handleCloseSettings();
        changeStateCallback(STATE_CHANGE_TYPE.pageSize, {pageSize: eventsPerPage});
        localStorage.setItem("pageSize", String(eventsPerPage));
    };

    const closeModal = () => {
        handleCloseSettings();
    };

    const openModal = () => {
        handleShowSettings();
        setEventsPerPage(logFileState.pageSize);
    };

    const getThemeIcon = () => {
        if (THEME_STATES.LIGHT === theme) {
            return (
                <Moon className="cursor-pointer" title="Set Light Mode"
                    onClick={() => switchTheme(THEME_STATES.DARK)}/>
            );
        } else if (THEME_STATES.DARK === theme) {
            return (
                <Sun className="cursor-pointer" title="Set Dark Mode"
                    onClick={() => switchTheme(THEME_STATES.LIGHT)}/>
            );
        }
    };
    return (
        <>
            <div className={"left-panel-tabs-container"}>
                <div style={{
                    display: "flex",
                    flexFlow: "column",
                    height: "100%",
                }}>
                    <div style={{flexGrow: 1}}>
                        <button
                            className={"left-panel-tab"}
                            onClick={openFile}>
                            <Folder size={25}/>
                        </button>
                        <button
                            className={"left-panel-tab" +
                                (LEFT_PANEL_TAB_IDS.SEARCH === activeTabId ? " -selected" : "")}
                            onClick={toggleSearchPanel}>
                            <Search size={25}/>
                        </button>
                    </div>
                    <div>
                        <button
                            className={"left-panel-tab"}
                            onClick={openModal}>
                            <Gear size={25}/>
                        </button>
                    </div>
                </div>
            </div>
            <input type='file' id='file' onChange={loadFile} ref={inputFile}
                style={{display: "none"}}/>
            <Modal show={showSettings} className="border-0" onHide={handleCloseSettings}
                contentClassName={getModalClass()}>
                <Modal.Header className="modal-background border-0" >
                    <div className="float-left">
                        App Settings
                    </div>
                    <div className="float-right">
                        {getThemeIcon()}
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-background p-3 pt-1" >
                    <label className="mb-2">Log Events per Page</label>
                    <Form onSubmit={saveModalChanges}>
                        <Form.Control type="number"
                            value={eventsPerPage}
                            onChange={(e) => setEventsPerPage(Number(e.target.value))}
                            className="input-sm num-event-input" />
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-background border-0" >
                    <Button className="btn-sm" variant="success" onClick={saveModalChanges}>
                        Save Changes
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export const LEFT_PANEL_TAB_IDS = {
    SEARCH: 0,
};
