import PropTypes from "prop-types";
import React, {
    useContext, useRef, useState,
} from "react";
import {
    Modal, ProgressBar,
} from "react-bootstrap";

import {
    VSCodeButton,
    VSCodeDataGrid,
    VSCodeDataGridCell,
    VSCodeDataGridRow, VSCodeDropdown, VSCodeOption, VSCodeTag,
    VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";

import {THEME_NAMES} from "../../../ThemeContext/constants";
import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import LOCAL_STORAGE_KEYS from "../../services/LOCAL_STORAGE_KEYS";
import MODIFY_PAGE_ACTION from "../../services/MODIFY_PAGE_ACTION";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import PageInput from "./EditableInput/PageInput";

import "./MenuBar.scss";


MenuBar.propTypes = {
    logFileState: PropTypes.object,
    fileMetaData: PropTypes.object,
    loadingLogs: PropTypes.bool,
    changeStateCallback: PropTypes.func,
    loadFileCallback: PropTypes.func,
};

/* eslint-disable @stylistic/js/array-element-newline, sort-keys */
const SHORTCUTS = [
    {
        action: "Focus on Editor",
        windows: ["`"],
        macOs: ["`"],
    },
    {
        action: "Next Page",
        windows: ["Ctrl", "]"],
        macOs: ["⌘", "]"],
    },
    {
        action: "Prev Page",
        windows: ["Ctrl", "["],
        macOs: ["⌘", "["],
    },
    {
        action: "First Page",
        windows: ["Ctrl", ","],
        macOs: ["⌘", ","],
    },
    {
        action: "Last Page",
        windows: ["Ctrl", "."],
        macOs: ["⌘", "."],
    },
    {
        action: "Go to Top",
        windows: ["Ctrl", "U"],
        macOs: ["⌘", "U"],
    },
    {
        action: "Go to Bottom",
        windows: ["Ctrl", "I"],
        macOs: ["⌘", "I"],
    },
];
/* eslint-enable @stylistic/js/array-element-newline, sort-keys */


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
 * @returns {JSX.Element}
 */
export function MenuBar ({
    logFileState,
    fileMetaData,
    loadingLogs,
    changeStateCallback,
    loadFileCallback,
}) {
    const {theme, changeTheme} = useContext(ThemeContext);

    const [eventsPerPage, setEventsPerPage] = useState(logFileState.pageSize);
    const [showSettings, setShowSettings] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleCloseSettings = () => setShowSettings(false);
    const handleShowSettings = () => setShowSettings(true);

    const handleCloseHelp = () => setShowHelp(false);
    const handleShowHelp = () => setShowHelp(true);

    const inputFile = useRef(null);

    const goToFirstPage = () => {
        if (1 !== logFileState.page) {
            changeStateCallback(
                STATE_CHANGE_TYPE.page,
                {action: MODIFY_PAGE_ACTION.firstPage}
            );
        }
    };

    const goToPrevPage = () => {
        changeStateCallback(
            STATE_CHANGE_TYPE.page,
            {action: MODIFY_PAGE_ACTION.prevPage}
        );
    };

    const goToNextPage = () => {
        changeStateCallback(
            STATE_CHANGE_TYPE.page,
            {action: MODIFY_PAGE_ACTION.nextPage}
        );
    };

    const goToLastPage = () => {
        if (logFileState.page !== logFileState.pages) {
            changeStateCallback(
                STATE_CHANGE_TYPE.page,
                {action: MODIFY_PAGE_ACTION.lastPage}
            );
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
    const saveModalChanges = (e) => {
        // TODO Can't backspace 0 from the number input
        // TODO What is the maximum number of events monaco can support?
        e.preventDefault();
        handleCloseSettings();
        changeStateCallback(STATE_CHANGE_TYPE.pageSize, {pageSize: eventsPerPage});
        localStorage.setItem(LOCAL_STORAGE_KEYS.PAGE_SIZE, String(eventsPerPage));
    };

    const closeModal = () => {
        handleCloseSettings();
    };

    const openModal = () => {
        handleShowSettings();
        setEventsPerPage(logFileState.pageSize);
    };

    const getPageNav = () => {
        return (
            <>
                <VSCodeButton
                    appearance={"icon"}
                    title={"First Page"}
                    onClick={goToFirstPage}
                >
                    <span className={"codicon codicon-triangle-left"}/>
                </VSCodeButton>

                <VSCodeButton
                    appearance={"icon"}
                    title={"Previous Page"}
                    onClick={goToPrevPage}
                >
                    <span className={"codicon codicon-chevron-left"}/>
                </VSCodeButton>

                <PageInput
                    maxValue={logFileState.pages}
                    minValue={1}
                    value={logFileState.page}
                    onSubmit={goToPage}/>

                <VSCodeButton
                    appearance={"icon"}
                    title={"Next Page"}
                    onClick={goToNextPage}
                >
                    <span className={"codicon codicon-chevron-right"}/>
                </VSCodeButton>

                <VSCodeButton
                    appearance={"icon"}
                    title={"Last Page"}
                    onClick={goToLastPage}
                >
                    <span className={"codicon codicon-triangle-right"}/>
                </VSCodeButton>
            </>
        );
    };

    const loadingBarHeight = "3px";
    const getLoadingBar = () => {
        return (loadingLogs) ?
            <ProgressBar
                animated={true}
                now={100}
                style={{height: loadingBarHeight}}/> :
            <div
                className={"w-100"}
                style={{height: loadingBarHeight}}/>;
    };

    // TODO make file icon a button to open modal with file info
    // TODO Move modals into their own component
    // TODO: move icon buttons into LeftPanel
    return (
        <>
            <div id={"menu-bar"}>
                <span id={"menu-bar-left"}>
                    <span
                        id={"menu-bar-file-info"}
                        title={fileMetaData.name}
                    >
                        <span
                            className={"codicon codicon-file-code"}
                            id={"menu-bar-file-info-icon"}/>
                        <span
                            className={"d-none d-lg-block"}
                        >
                            {fileMetaData.name}
                        </span>
                    </span>
                </span>
                {getPageNav()}

                <VSCodeButton
                    appearance={"icon"}
                    title={"Settings"}
                    onClick={openModal}
                >
                    <span className={"codicon codicon-settings-gear"}/>
                </VSCodeButton>

                <VSCodeButton
                    appearance={"icon"}
                    title={"Open File (or Drag and Drop File)"}
                    onClick={openFile}
                >
                    <span className={"codicon codicon-folder-opened"}/>
                </VSCodeButton>

                <input
                    id={"file"}
                    ref={inputFile}
                    style={{display: "none"}}
                    type={"file"}
                    onChange={loadFile}/>

                <VSCodeButton
                    appearance={"icon"}
                    title={"Show Help"}
                    onClick={handleShowHelp}
                >
                    <span className={"codicon codicon-record-keys"}/>
                </VSCodeButton>
                {getLoadingBar()}
            </div>

            <Modal
                contentClassName={"modal-dark"}
                show={showSettings}
                onHide={handleCloseSettings}
            >
                <Modal.Header className={"border-0"}>
                    App Settings
                </Modal.Header>
                <Modal.Body style={{display: "flex", flexDirection: "column", gap: "12px"}}>
                    <VSCodeTextField
                        style={{flexGrow: 1}}
                        type={"number"}
                        value={eventsPerPage}
                        onInput={(e) => {
                            setEventsPerPage(Number(e.target.value));
                        }}
                    >
                        Log Events per Page
                    </VSCodeTextField>

                    <div id={"theme-dropdown-container"}>
                        {/* TODO: revisit once this issue is fixed
                            https://github.com/microsoft/vscode-webview-ui-toolkit/issues/461#issuecomment-1478408942
                            then we do not have to put the label outside of the dropdown */}
                        <label
                            htmlFor={"theme-dropdown"}
                            id={"theme-dropdown-label"}
                        >
                            Theme
                        </label>
                        <VSCodeDropdown
                            id={"theme-dropdown"}
                            value={theme}
                            onChange={(e) => {
                                changeTheme(e.target.value);
                            }}
                        >
                            {Object.entries(THEME_NAMES).map(([themeName, themeValue]) => (
                                <VSCodeOption
                                    key={themeName}
                                    value={themeValue}
                                >
                                    {themeValue}
                                </VSCodeOption>
                            ))}
                        </VSCodeDropdown>
                    </div>

                </Modal.Body>
                <Modal.Footer className={"border-0"}>
                    <VSCodeButton
                        appearance={"secondary"}
                        onClick={closeModal}
                    >
                        Close
                    </VSCodeButton>
                    <VSCodeButton
                        appearance={"primary"}
                        onClick={saveModalChanges}
                    >
                        Save Changes
                    </VSCodeButton>
                </Modal.Footer>
            </Modal>

            <Modal
                className={"border-0"}
                contentClassName={"modal-dark"}
                show={showHelp}
                onHide={handleCloseHelp}
            >
                <Modal.Header className={"modal-background border-0"}>
                    Keyboard Shortcuts
                </Modal.Header>
                <Modal.Body className={"modal-background"}>
                    <VSCodeDataGrid>
                        <VSCodeDataGridRow rowType={"header"}>
                            {[
                                "Action",
                                "Windows",
                                "macOS",
                            ].map((h, i) => (
                                <VSCodeDataGridCell
                                    cellType={"columnheader"}
                                    gridColumn={(i + 1).toString()}
                                    key={i}
                                >
                                    {h}
                                </VSCodeDataGridCell>
                            ))}
                        </VSCodeDataGridRow>
                        {SHORTCUTS.map((s, actionIdx) => (
                            <VSCodeDataGridRow key={actionIdx}>
                                <VSCodeDataGridCell gridColumn={"1"}>
                                    {s.action}
                                </VSCodeDataGridCell>
                                <VSCodeDataGridCell gridColumn={"2"}>
                                    {s.windows.map((k, keyIdx) => (
                                        <span key={keyIdx}>
                                            <VSCodeTag>
                                                {k}
                                            </VSCodeTag>
                                            {((s.windows.length - 1) !== keyIdx) &&
                                                " + "}
                                        </span>
                                    ))}
                                </VSCodeDataGridCell>
                                <VSCodeDataGridCell gridColumn={"3"}>
                                    {s.macOs.map((k, keyIdx) => (
                                        <span key={keyIdx}>
                                            <VSCodeTag>
                                                {k}
                                            </VSCodeTag>
                                            {((s.windows.length - 1) !== keyIdx) &&
                                                    " + "}
                                        </span>
                                    ))}
                                </VSCodeDataGridCell>
                            </VSCodeDataGridRow>
                        ))}
                    </VSCodeDataGrid>
                </Modal.Body>
                <Modal.Footer className={"border-0"}>
                    <VSCodeButton
                        appearance={"secondary"}
                        onClick={handleCloseHelp}
                    >
                        Close
                    </VSCodeButton>
                </Modal.Footer>
            </Modal>
        </>
    );
}
