import PropTypes from "prop-types";
import React, {
    useContext, useState,
} from "react";
import {ProgressBar} from "react-bootstrap";
import {
    ChevronDoubleLeft,
    ChevronDoubleRight,
    ChevronLeft,
    ChevronRight,
    FileText,
    Folder,
    Gear,
    Keyboard,
} from "react-bootstrap-icons";

import {THEME_NAMES} from "../../../ThemeContext/constants";
import {ThemeContext} from "../../../ThemeContext/ThemeContext";
import LOCAL_STORAGE_KEYS from "../../services/LOCAL_STORAGE_KEYS";
import MODIFY_PAGE_ACTION from "../../services/MODIFY_PAGE_ACTION";
import STATE_CHANGE_TYPE from "../../services/STATE_CHANGE_TYPE";
import HelpModal from "../modals/HelpModal/HelpModal";
import SettingsModal from "../modals/SettingsModal/SettingsModal";
import {EditableInput} from "./EditableInput/EditableInput";

import "./MenuBar.scss";


const NavigationBar = ({
    logFileState,
    maxValue,
    value,

    onStateChange,
}) => {
    const goToFirstPage = () => {
        if (1 !== logFileState.page) {
            onStateChange(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.firstPage});
        }
    };

    const goToPrevPage = () => {
        onStateChange(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.prevPage});
    };

    const goToNextPage = () => {
        onStateChange(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.nextPage});
    };

    const goToLastPage = () => {
        if (logFileState.page !== logFileState.pages) {
            onStateChange(STATE_CHANGE_TYPE.page, {action: MODIFY_PAGE_ACTION.lastPage});
        }
    };

    const goToPage = (page) => {
        onStateChange(STATE_CHANGE_TYPE.page, {
            action: MODIFY_PAGE_ACTION.newPage,
            requestedPage: page,
        });
    };


    return (
        <>
            <div
                className={"menu-item menu-item-btn"}
                onClick={goToFirstPage}
            >
                <ChevronDoubleLeft title={"First Page"}/>
            </div>
            <div
                className={"menu-item menu-item-btn"}
                onClick={goToPrevPage}
            >
                <ChevronLeft title={"Previous Page"}/>
            </div>
            <div className={"menu-item"}>
                <EditableInput
                    maxValue={maxValue}
                    minValue={1}
                    value={value}
                    onChangeCallback={goToPage}/>
                <span className={"mx-1"}>
                    {` of ${maxValue}`}
                </span>
            </div>
            <div
                className={"menu-item menu-item-btn"}
                onClick={goToNextPage}
            >
                <ChevronRight title={"Next Page"}/>
            </div>
            <div
                className={"menu-item menu-item-btn"}
                onClick={goToLastPage}
            >
                <ChevronDoubleRight title={"Last Page"}/>
            </div>
        </>
    );
};

NavigationBar.propTypes = {
    logFileState: PropTypes.object,
    maxValue: PropTypes.any,
    value: PropTypes.any,

    onStateChange: PropTypes.func,
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
 * @param {object} fileMetaData
 * @param {boolean} isLoadingLogs
 * @param {object} logFileState
 * @param {ChangeStateCallback} onStateChange
 * @param {LoadFileCallback} onFileLoad
 * @returns {JSX.Element}
 */
const MenuBar = ({
    fileMetaData,
    isLoadingLogs,
    logFileState,
    onFileLoad,
    onStateChange,
}) => {
    const {theme} = useContext(ThemeContext);

    const [eventsPerPage, setEventsPerPage] = useState(logFileState.pageSize);
    const [showSettings, setShowSettings] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleCloseSettings = () => setShowSettings(false);
    const handleShowSettings = () => setShowSettings(true);

    const handleCloseHelp = () => setShowHelp(false);
    const handleShowHelp = () => setShowHelp(true);

    // File functions
    const handleOpenFile = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = (e) => {
            onFileLoad(e.target.files[0]);
        };

        input.click();
    };

    // Modal Functions
    const getModalClass = () => {
        return (THEME_NAMES.LIGHT === theme) ?
            "modal-light" :
            "modal-dark";
    };

    const saveModalChanges = (e) => {
        // TODO Can't backspace 0 from the number input
        // TODO What is the maximum number of events monaco can support?
        e.preventDefault();
        handleCloseSettings();
        onStateChange(STATE_CHANGE_TYPE.pageSize, {pageSize: eventsPerPage});
        localStorage.setItem(LOCAL_STORAGE_KEYS.PAGE_SIZE, String(eventsPerPage));
    };

    // TODO make file icon a button to open modal with file info
    return (
        <>
            <div
                className={"viewer-header"}
                data-theme={theme}
            >
                <div className={"w-100 loading-progress-bar"}/>
                <div className={"viewer-header-menu-container"}>
                    <div className={"menu-left"}>
                        <div
                            className={"menu-item"}
                            title={fileMetaData.name}
                        >
                            <FileText className={"mx-2"}/>
                            <span className={"d-none d-lg-block"}>
                                {fileMetaData.name}
                            </span>
                        </div>
                    </div>
                    <div className={"menu-right"}>
                        <NavigationBar
                            logFileState={logFileState}
                            maxValue={logFileState.pages}
                            value={logFileState.page}
                            onStateChange={onStateChange}/>

                        <div className={"menu-divider"}/>
                        <div
                            className={"menu-item menu-item-btn"}
                            onClick={handleShowSettings}
                        >
                            <Gear/>
                        </div>
                        <div className={"menu-divider"}/>
                        <div
                            className={"menu-item menu-item-btn"}
                            title={"Open File"}
                            onClick={handleOpenFile}
                        >
                            <Folder/>
                        </div>
                        <div className={"menu-divider"}/>
                        <div
                            className={"menu-item menu-item-btn"}
                            title={"Show Help"}
                            onClick={handleShowHelp}
                        >
                            <Keyboard/>
                        </div>
                    </div>
                </div>
                <ProgressBar
                    animated={true}
                    className={"loading-progress-bar"}
                    now={100}
                    style={{
                        visibility: isLoadingLogs ?
                            "visible" :
                            "hidden",
                    }}/>
            </div>

            <SettingsModal
                isOpen={showSettings}
                modalClass={getModalClass()}
                value={eventsPerPage}
                onClose={handleCloseSettings}
                onSubmit={saveModalChanges}
                onChange={(e) => setEventsPerPage(
                    Number(e.target.value)
                )}/>

            <HelpModal
                isOpen={showHelp}
                modalClass={getModalClass()}
                theme={theme}
                onClose={handleCloseHelp}/>
        </>
    );
};

MenuBar.propTypes = {
    fileMetaData: PropTypes.object,
    isLoadingLogs: PropTypes.bool,
    logFileState: PropTypes.object,

    onFileLoad: PropTypes.func,
    onStateChange: PropTypes.func,
};

export default MenuBar;
