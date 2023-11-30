import React, {useContext, useState} from "react";

import PropTypes from "prop-types";
import {Button, Modal, ProgressBar, Table} from "react-bootstrap";
import {
    ChevronDoubleLeft,
    ChevronDoubleRight,
    ChevronLeft,
    ChevronRight,
    FileText,
    Keyboard
} from "react-bootstrap-icons";

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
};

/**
 * Callback used to change the parent component's state
 * @callback ChangeStateCallback
 * @param {string} type The type of state change ({@link STATE_CHANGE_TYPE})
 * @param {object} args Arguments used to update the state
 */

/**
 * Menu bar used to navigate the log file.
 * @param {object} logFileState Current state of the log file
 * @param {object} fileMetaData Object containing file metadata
 * @param {boolean} loadingLogs Indicates if logs are being decoded and
 *                              loaded by worker.
 * @param {ChangeStateCallback} changeStateCallback
 * @return {JSX.Element}
 */
export function MenuBar ({
    logFileState,
    fileMetaData,
    loadingLogs,
    changeStateCallback,
}) {
    const {theme} = useContext(ThemeContext);
    const [showHelp, setShowHelp] = useState(false);

    const handleCloseHelp = () => setShowHelp(false);
    const handleShowHelp = () => setShowHelp(true);


    // Modal Functions
    const getModalClass = () => {
        return (THEME_STATES.LIGHT === theme)?"modal-light":"modal-dark";
    };

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
                        <div className="menu-item menu-item-btn" onClick={handleShowHelp}
                            title="Show Help">
                            <Keyboard/>
                        </div>
                    </div>
                </div>
                {getLoadingBar()}
            </div>

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
