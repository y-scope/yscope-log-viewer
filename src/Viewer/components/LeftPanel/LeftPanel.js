import React, {useCallback} from "react";

import PropTypes from "prop-types";
import {Search} from "react-bootstrap-icons";

import {ResizeHandle} from "../ResizeHandle/ResizeHandle";

import "./LeftPanel.scss";

LeftPanel.propTypes = {
    panelWidth: PropTypes.number,
    setPanelWidth: PropTypes.func,
    activeTabId: PropTypes.number,
    setActiveTabId: PropTypes.func,
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
 * The left panel component
 * @param {number} panelWidth
 * @param {SetPanelWidth} setPanelWidth
 * @param {number} activeTabId
 * @param {SetActiveTabId} setActiveTabId
 * @param {JSX.Element} children
 * @return {JSX.Element}
 */
export function LeftPanel ({panelWidth, setPanelWidth, activeTabId, setActiveTabId, children}) {
    const handleLeftPanelResize = useCallback((newWidth) => {
        setPanelWidth((prev) => {
            if (newWidth > window.innerWidth * 0.8) {
                return prev;
            }
            // get panel to snap if it gets too small
            if (newWidth < 20) {
                return 0;
            }
            return newWidth;
        });
    }, []);

    const togglePanel = (activeTabId) => {
        setActiveTabId(activeTabId);
        setPanelWidth((prev) => {
            if (prev > 0) {
                return 0;
            } else {
                return window.innerWidth * 0.2;
            }
        });
    };

    return (
        <>
            <LeftPanelTabs
                activeTabId={panelWidth > 0 ? activeTabId : -1}
                togglePanel={togglePanel}
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
    activeTabId: PropTypes.number,
    togglePanel: PropTypes.func,
};

/**
 * Callback used to toggle (open/close) the panel
 * @callback TogglePanel
 * @param {number} activeTabId
 */

/**
 * The tabs of the left panel
 * @param {number} activeTabId
 * @param {TogglePanel} togglePanel
 * @return {JSX.Element}
 */
function LeftPanelTabs ({activeTabId, togglePanel}) {
    const toggleSearchPanel = () => {
        togglePanel(LEFT_PANEL_TAB_IDS.SEARCH);
    };

    return (
        <div className={"left-panel-tabs-container"}>
            <div style={{
                display: "flex",
                flexFlow: "column",
                height: "100%",
            }}>
                <div style={{flexGrow: 1}}>
                    <button
                        className={"left-panel-tab" + (
                            LEFT_PANEL_TAB_IDS.SEARCH === activeTabId
                                ? " left-panel-tab-selected" : ""
                        )}
                        onClick={toggleSearchPanel}>
                        <Search size={25}/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export const LEFT_PANEL_TAB_IDS = {
    SEARCH: 0,
};
