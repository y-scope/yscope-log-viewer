import React, {
    useCallback,
    useRef,
    useState,
} from "react";

import {TAB_NAME} from "../../typings/tab";
import PanelTabs from "./PanelTabs";
import ResizeHandle from "./ResizeHandle";

import "./index.css";


const PANEL_DEFAULT_WIDTH_IN_PIXEL = 360;
const PANEL_CLIP_THRESHOLD_IN_PIXEL = 250;
const PANEL_MAX_WIDTH_TO_WINDOW_WIDTH_RATIO = 0.8;

interface SidebarContainerProps {
    children: React.ReactNode,
}

/**
 * Gets width of the panel from body style properties.
 *
 * @return the width in pixels as a number.
 */
const getPanelWidth = () => parseInt(
    document.body.style.getPropertyValue("--ylv-panel-width"),
    10
);

/**
 * Sets width of the panel in body style properties.
 *
 * @param newValue in pixels.
 */
const setPanelWidth = (newValue: number) => {
    document.body.style.setProperty("--ylv-panel-width", `${newValue}px`);
};

/**
 * Wraps a children with a sidebar component on the left.
 *
 * @param props
 * @param props.children
 * @return
 */
const SidebarContainer = ({children}: SidebarContainerProps) => {
    const [activeTabName, setActiveTabName] = useState<TAB_NAME>(TAB_NAME.FILE_INFO);

    const tabListRef = useRef<HTMLDivElement>(null);

    const deactivateTabAndHideResizeHandle = () => {
        setActiveTabName(TAB_NAME.NONE);
        document.body.style.setProperty("--ylv-panel-resize-handle-width", "0px");
    };

    const handleActiveTabNameChange = useCallback((tabName: TAB_NAME) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }

        if (activeTabName === tabName) {
            deactivateTabAndHideResizeHandle();
            setPanelWidth(tabListRef.current.clientWidth);

            return;
        }
        setActiveTabName(tabName);
        setPanelWidth(PANEL_DEFAULT_WIDTH_IN_PIXEL);
        document.body.style.setProperty("--ylv-panel-resize-handle-width", "3px");
    }, [activeTabName]);

    const handleResizeHandleRelease = useCallback(() => {
        if (getPanelWidth() === tabListRef.current?.clientWidth) {
            deactivateTabAndHideResizeHandle();
        }
    }, []);

    const handleResize = useCallback((resizeHandlePosition: number) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }
        if (tabListRef.current.clientWidth + PANEL_CLIP_THRESHOLD_IN_PIXEL > resizeHandlePosition) {
            // If the resize handle is positioned to the right of the <TabList/>'s right edge
            // with a clipping threshold accounted, close the panel.
            setPanelWidth(tabListRef.current.clientWidth);
        } else if (
            resizeHandlePosition < window.innerWidth * PANEL_MAX_WIDTH_TO_WINDOW_WIDTH_RATIO
        ) {
            // If the resize handle is positioned to the left of 80% of the window's width,
            // update the panel width with the distance between the mouse pointer and the
            // window's left edge.
            setPanelWidth(resizeHandlePosition);
        }
    }, []);

    return (
        <div className={"sidebar-container"}>
            <div className={"sidebar-tabs-container"}>
                <PanelTabs
                    activeTabName={activeTabName}
                    ref={tabListRef}
                    onActiveTabNameChange={handleActiveTabNameChange}/>
                <ResizeHandle
                    onHandleRelease={handleResizeHandleRelease}
                    onResize={handleResize}/>
            </div>
            <div className={"sidebar-children-container"}>
                {children}
            </div>
        </div>
    );
};

export default SidebarContainer;
