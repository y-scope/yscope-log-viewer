import React, {useContext, useRef, useState} from "react";

import PropTypes from "prop-types";
import {Button, Form, Modal, ProgressBar, Table} from "react-bootstrap";
import {ChevronDoubleLeft, ChevronDoubleRight, ChevronLeft, ChevronRight,
    FileText, Folder, Gear, Keyboard, Moon, Sun, Search} from "react-bootstrap-icons";

import {THEME_STATES} from "../../../ThemeContext/THEME_STATES";
import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import MODIFY_PAGE_ACTION from "../../services/MODIFY_PAGE_ACTION";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import {EditableInput} from "./EditableInput/EditableInput";

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
export function MenuBar ({
    logFileState, fileMetaData, loadingLogs, changeStateCallback, loadFileCallback,
}) {
    const {theme, switchTheme} = useContext(ThemeContext);

    const [eventsPerPage, setEventsPerPage] = useState(logFileState.pages);
    const [searchString, setSearchString] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleCloseSettings = () => setShowSettings(false);
    const handleShowSettings = () => setShowSettings(true);

    const handleCloseSearch = () => setShowSearch(false);
    const handleShowSearch = () => setShowSearch(true);

    const handleCloseHelp = () => setShowHelp(false);
    const handleShowHelp = () => setShowHelp(true);

    const inputFile = useRef(null);

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

    const saveSearchChanges = (e) => {
        e.preventDefault();
        handleCloseSearch();
        changeStateCallback(STATE_CHANGE_TYPE.search, {searchString: searchString});
    };

    const closeModal = () => {
        handleCloseSettings();
    };

    const closeSearchModal = () => {
        handleCloseSearch();
    };

    const openModal = () => {
        handleShowSettings();
        setEventsPerPage(logFileState.pageSize);
    };

    const openSearchModal = () => {
        handleShowSearch();
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

    const loadingBarHeight = "3px";
    const getLoadingBar = () => {
        return (loadingLogs)
            ?<ProgressBar animated now={100} style={{height: loadingBarHeight}}/>
            :<div style={{height: loadingBarHeight}} className="w-100" />;
    };

    // TODO make file icon a button to open modal with file info
    // TODO Move modals into their own component
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
                        <div className="menu-item menu-item-btn" onClick={openModal}>
                            <Gear/>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="menu-item menu-item-btn" onClick={openSearchModal}>
                            <Search/>
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

            <Modal show={showSearch} className="border-0" onHide={handleCloseSearch}
            contentClassName={getModalClass()}>
                <Modal.Header className="modal-background" >
                    <div className="float-left">
                        Search String
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-background p-3 pt-1" >
                    <Form onSubmit={saveSearchChanges}>
                        <Form.Control type="text"
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                            className="input-sm num-event-input" />
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-background border-0" >
                    <Button className="btn-sm" variant="success" onClick={saveSearchChanges}>
                        Go
                    </Button>
                    <Button className="btn-sm" variant="secondary" onClick={closeSearchModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={showHelp} className="help-modal border-0" onHide={handleCloseHelp}
                contentClassName={getModalClass()} data-theme={theme}>
                <Modal.Header className="modal-background" >
                    <div className="float-left">
                        Keyboard Shortcuts
                    </div>
                </Modal.Header>
                <Modal.Body className="modal-background p-3 pt-2" >
                    <Table borderless style={{fontSize: "15px"}} >
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Windows</th>
                                <th>macOS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Focus on Editor</td>
                                <td>
                                    <kbd>`</kbd>
                                </td>
                                <td>
                                    <kbd>`</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Next Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>]</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>]</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Prev Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>[</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>[</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>First Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>,</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>,</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Last Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>.</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>.</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>Top of Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>U</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>U</kbd>
                                </td>
                            </tr>
                            <tr>
                                <td>End of Page</td>
                                <td>
                                    <kbd>CTRL</kbd>+<kbd>I</kbd>
                                </td>
                                <td>
                                    <kbd>⌘</kbd>+<kbd>I</kbd>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer className="modal-background" >
                    <Button className="btn-sm" variant="secondary" onClick={handleCloseHelp}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
