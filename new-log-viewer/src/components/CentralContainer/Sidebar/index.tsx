import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {CONFIG_KEY} from "../../../typings/config";
import {TAB_NAME} from "../../../typings/tab";
import {
    getConfig,
    setConfig,
} from "../../../utils/config";
import ResizeHandle from "./ResizeHandle";
import SidebarTabs from "./SidebarTabs";

import "./index.css";


const PANEL_DEFAULT_WIDTH_IN_PIXELS = 336;
const PANEL_CLIP_THRESHOLD_IN_PIXELS = 336;
const EDITOR_MIN_WIDTH_IN_PIXELS = 100;

/**
 * Gets width of the panel from body style properties.
 *
 * @return the width in pixels as a number.
 */
const getPanelWidth = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--ylv-panel-width"),
    10
);

/**
 * Sets width of the panel in body style properties.
 *
 * @param newValue in pixels.
 */
const setPanelWidth = (newValue: number) => {
    document.documentElement.style.setProperty("--ylv-panel-width", `${newValue}px`);
};


/**
 * Renders a sidebar component that displays tabbed panels and a resize handle.
 * The active tab can be changed and the sidebar can be resized by dragging the handle.
 *
 * @return
 */
const Sidebar = () => {
    const initialTabName = useMemo(() => getConfig(CONFIG_KEY.INITIAL_TAB_NAME), []);
    const [activeTabName, setActiveTabName] = useState<TAB_NAME>(initialTabName);
    const tabListRef = useRef<HTMLDivElement>(null);

    const handleActiveTabNameChange = useCallback((tabName: TAB_NAME) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }

        let newTabName = tabName;
        let newPanelWidth = PANEL_DEFAULT_WIDTH_IN_PIXELS;
        if (activeTabName === tabName) {
            newTabName = TAB_NAME.NONE;
            newPanelWidth = tabListRef.current.clientWidth;
        }
        setActiveTabName(newTabName);
        setConfig({key: CONFIG_KEY.INITIAL_TAB_NAME, value: newTabName});
        setPanelWidth(newPanelWidth);
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
        } else {
            // If the resize handle is positioned within the area where the editor width can be
            // resized, update the panel width with the distance between the mouse pointer and the
            // window's left edge; otherwise, set the panel width as the available width.
            const availableWidth = window.innerWidth - EDITOR_MIN_WIDTH_IN_PIXELS;
            if (resizeHandlePosition < availableWidth) {
                setPanelWidth(resizeHandlePosition);
            } else {
                setPanelWidth(availableWidth);
            }
        }
    }, []);

    // On initialization, register window resize event handler to resize panel width when necessary.
    useEffect(() => {
        const handleWindowResize = () => {
            const availableWidth = window.innerWidth - EDITOR_MIN_WIDTH_IN_PIXELS;
            if (
                getPanelWidth() > availableWidth &&
                tabListRef.current &&
                tabListRef.current.clientWidth + PANEL_CLIP_THRESHOLD_IN_PIXELS < availableWidth
            ) {
                setPanelWidth(availableWidth);
            }
        };

        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    // On initialization, do not show panel if there is no active tab.
    useEffect(() => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }
        if (TAB_NAME.NONE === initialTabName) {
            setPanelWidth(tabListRef.current.clientWidth);
        }
    }, [initialTabName]);

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
