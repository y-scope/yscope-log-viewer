import React, {useContext, useRef, useState} from "react";

import PropTypes from "prop-types";
import {Modal, ProgressBar} from "react-bootstrap";
import {ChevronDoubleLeft, ChevronDoubleRight, ChevronLeft, ChevronRight,
    FileText, Folder, Gear, Keyboard} from "react-bootstrap-icons";

import {THEME_STATES} from "../../../ThemeContext/THEME_STATES";
import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import MODIFY_PAGE_ACTION from "../../services/MODIFY_PAGE_ACTION";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import {EditableInput} from "./EditableInput/EditableInput";
import {HelpModal} from "./HelpModal/HelpModal";
import {SettingsModal} from "./SettingsModal/SettingsModal";

import "./MenuBar.scss";

MenuBar.propTypes = {
    logFileState: PropTypes.object,
    fileMetaData: PropTypes.object,
    loadingLogs: PropTypes.bool,
    changeStateCallback: PropTypes.func,
    loadFileCallback: PropTypes.func,
};

/**
 * Callback used to change the parent component's state
 * @callback ChangeStateCallback
 * @param {string} type The type of state change ({@link STATE_CHANGE_TYPE})
 * @param {object} args Arguments used to update the state
 */

/**
 * This callback is used to load a new file.
 *
 * @callback LoadFileCallback
 * @param {File|String} fileInfo File object or file path to load.
 */

/**
 * Menu bar used to navigate the log file.
 * @param {object} logFileState Current state of the log file
 * @param {object} fileMetaData Object containing file metadata
 * @param {boolean} loadingLogs Indicates if logs are being decoded and
 *                              loaded by worker.
 * @param {ChangeStateCallback} changeStateCallback
 * @param {LoadFileCallback} loadFileCallback
 * @return {JSX.Element}
 */
export function MenuBar ({logFileState, fileMetaData, loadingLogs,
    changeStateCallback, loadFileCallback}) {
    const {theme} = useContext(ThemeContext);

    // Modal State Variables
    const [showSettings, setShowSettings] = useState(false);
    const handleCloseSettings = () => setShowSettings(false);
    const handleShowSettings = () => setShowSettings(true);

    const [showHelp, setShowHelp] = useState(false);
    const handleCloseHelp = () => setShowHelp(false);
    const handleShowHelp = () => setShowHelp(true);

    // Page navigation functions
    const goToFirstPage = () => {
        if (logFileState.page !== 1) {
            changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.firstPage});
        }
    };

    const goToPrevPage = () => {
        changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.prevPage});
    };

    const goToNextPage = () => {
        changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.nextPage});
    };

    const goToLastPage = () => {
        if (logFileState.page !== logFileState.pages) {
            changeStateCallback(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.lastPage});
        }
    };

    const goToPage = (page) => {
        changeStateCallback(STATE_CHANGE_TYPE.page, {
            action: MODIFY_PAGE_ACTION.newPage,
            requestedPage: page,
        });
    };

    const getPageNav = () => {
        return (
            <>
                <div className="menu-item menu-item-btn" onClick={goToFirstPage}>
                    <ChevronDoubleLeft title="First Page"/>
                </div>
                <div className="menu-item menu-item-btn" onClick={goToPrevPage}>
                    <ChevronLeft title="Previous Page"/>
                </div>
                <div className="menu-item">
                    <EditableInput value={logFileState.page} minValue={1}
                        maxValue={logFileState.pages} onChangeCallback={goToPage}/>
                    <span className="mx-1"> of</span>
                    <span className="mx-1"> {logFileState.pages}</span>
                </div>
                <div className="menu-item menu-item-btn" onClick={goToNextPage}>
                    <ChevronRight title="Next Page"/>
                </div>
                <div className="menu-item menu-item-btn" onClick={goToLastPage}>
                    <ChevronDoubleRight title="Last Page"/>
                </div>
            </>
        );
    };

    // File State and functions
    const inputFile = useRef(null);
    const openFile = () => {
        inputFile.current.click();
    };
    const loadFile = (e) => {
        loadFileCallback(e.target.files[0]);
    };

    // Callback to save the changes in the settings modal
    const saveSettingsChanges = (eventsPerPage) => {
        // TODO What is the maximum number of events monaco can support?
        changeStateCallback(STATE_CHANGE_TYPE.pageSize, {pageSize: eventsPerPage});
        localStorage.setItem("pageSize", String(eventsPerPage));
    };

    // Loading bar functions and variables
    const loadingBarHeight = "3px";
    const getLoadingBar = () => {
        return (loadingLogs)
            ?<ProgressBar animated now={100} style={{height: loadingBarHeight}}/>
            :<div style={{height: loadingBarHeight}} className="w-100" />;
    };

    // TODO make file icon a button to open modal with file info
    return (
        <>
            <div className="viewer-header" data-theme={theme}>
                <div style={{height: loadingBarHeight}} className="w-100" />
                <div className="viewer-header-menu-container">
                    <div className="menu-left">
                        <div className="menu-item" title={fileMetaData.name}>
                            <FileText className="mx-2"/>
                            <span className="d-none d-lg-block">{fileMetaData.name}</span>
                        </div>
                    </div>
                    <div className="menu-right">
                        {getPageNav()}
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={handleShowSettings}>
                            <Gear/>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={openFile}
                            title="Open File (or Drag and Drop File)">
                            <Folder/>
                        </div>
                        <input type='file' id='file' onChange={loadFile} ref={inputFile}
                            style={{display: "none"}}/>
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={handleShowHelp}
                            title="Show Help">
                            <Keyboard/>
                        </div>
                    </div>
                </div>
                {getLoadingBar()}
            </div>

            <Modal show={showSettings} className="border-0" onHide={handleCloseSettings}
                contentClassName={(THEME_STATES.LIGHT === theme)?"modal-light":"modal-dark"}>
                <SettingsModal
                    handleClose={handleCloseSettings}
                    saveChangesCallback={saveSettingsChanges}
                    initialEventsPerPage={logFileState.pageSize}
                ></SettingsModal>
            </Modal>

            <Modal show={showHelp} className="help-modal border-0" onHide={handleCloseHelp}
                contentClassName={(THEME_STATES.LIGHT === theme)?"modal-light":"modal-dark"}>
                <HelpModal handleClose={handleCloseHelp}></HelpModal>
            </Modal>
        </>
    );
}
