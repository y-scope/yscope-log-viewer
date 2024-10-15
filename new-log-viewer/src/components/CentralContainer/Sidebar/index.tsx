import {
    useCallback,
    useRef,
    useState,
} from "react";

import {TAB_NAME} from "../../../typings/tab";
import ResizeHandle from "./ResizeHandle";
import SidebarTabs from "./SidebarTabs";

import "./index.css";


const PANEL_DEFAULT_WIDTH_IN_PIXELS = 360;
const PANEL_CLIP_THRESHOLD_IN_PIXELS = 250;
const PANEL_MAX_WIDTH_TO_WINDOW_WIDTH_RATIO = 0.8;

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
 * Renders a sidebar component that displays tabbed panels and a resize handle.
 * The active tab can be changed and the sidebar can be resized by dragging the handle.
 *
 * @return
 */
const Sidebar = () => {
    const [activeTabName, setActiveTabName] = useState<TAB_NAME>(TAB_NAME.FILE_INFO);

    const tabListRef = useRef<HTMLDivElement>(null);

    const handleActiveTabNameChange = useCallback((tabName: TAB_NAME) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }

        if (activeTabName === tabName) {
            setActiveTabName(TAB_NAME.NONE);
            setPanelWidth(tabListRef.current.clientWidth);

            return;
        }
        setActiveTabName(tabName);
        setPanelWidth(PANEL_DEFAULT_WIDTH_IN_PIXELS);
    }, [activeTabName]);

    const handleResizeHandleRelease = useCallback(() => {
        if (getPanelWidth() === tabListRef.current?.clientWidth) {
            setActiveTabName(TAB_NAME.NONE);
        }
    }, []);

    const handleResize = useCallback((resizeHandlePosition: number) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }
        if (
            tabListRef.current.clientWidth + PANEL_CLIP_THRESHOLD_IN_PIXELS >
            resizeHandlePosition
        ) {
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
        <div className={"sidebar-tabs-container"}>
            <SidebarTabs
                activeTabName={activeTabName}
                ref={tabListRef}
                onActiveTabNameChange={handleActiveTabNameChange}/>
            {TAB_NAME.NONE !== activeTabName && <ResizeHandle
                onHandleRelease={handleResizeHandleRelease}
                onResize={handleResize}/>}
        </div>
    );
};

export default Sidebar;
