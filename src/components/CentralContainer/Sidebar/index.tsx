import {
    useCallback,
    useEffect,
    useRef,
} from "react";

import useUiStore from "../../../stores/uiStore";
import {CONFIG_KEY} from "../../../typings/config";
import {TAB_NAME} from "../../../typings/tab";
import {setConfig} from "../../../utils/config";
import {clamp} from "../../../utils/math";
import ResizeHandle from "./ResizeHandle";
import SidebarTabs from "./SidebarTabs";

import "./index.css";


const PANEL_DEFAULT_WIDTH_IN_PIXELS = 360;
const PANEL_CLIP_THRESHOLD_IN_PIXELS = 250;
const EDITOR_MIN_WIDTH_IN_PIXELS = 250;

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
    const activeTabName = useUiStore((state) => state.activeTabName);
    const setActiveTabName = useUiStore((state) => state.setActiveTabName);
    const tabListRef = useRef<HTMLDivElement>(null);

    const handleResizeHandleRelease = useCallback(() => {
        if (getPanelWidth() === tabListRef.current?.clientWidth) {
            setActiveTabName(TAB_NAME.NONE);
        }
    }, [setActiveTabName]);

    const handleResize = useCallback((resizeHandlePosition: number) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }
        if (PANEL_CLIP_THRESHOLD_IN_PIXELS > resizeHandlePosition) {
            // If the resize handle is positioned to the right of the <TabList/>'s right edge
            // with a clipping threshold accounted, close the panel.
            setPanelWidth(tabListRef.current.clientWidth);
        } else {
            // Update the panel width with the distance between the mouse pointer and the window's
            // left edge.
            setPanelWidth(
                clamp(
                    window.innerWidth - EDITOR_MIN_WIDTH_IN_PIXELS,
                    PANEL_CLIP_THRESHOLD_IN_PIXELS,
                    resizeHandlePosition
                )
            );
        }
    }, []);

    // On initialization, register window resize event handler to resize panel width when necessary.
    useEffect(() => {
        const handleWindowResize = () => {
            const availableWidth = Math.max(
                window.innerWidth - EDITOR_MIN_WIDTH_IN_PIXELS,
                PANEL_CLIP_THRESHOLD_IN_PIXELS
            );

            if (getPanelWidth() > availableWidth) {
                setPanelWidth(availableWidth);
            }
        };

        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    // On `activeTabName` update, update INITIAL_TAB_NAME in config and adjust panel width.
    useEffect(() => {
        setConfig({key: CONFIG_KEY.INITIAL_TAB_NAME, value: activeTabName});

        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }

        if (activeTabName === TAB_NAME.NONE) {
            setPanelWidth(tabListRef.current.clientWidth);

            return;
        }

        setPanelWidth(
            clamp(
                window.innerWidth - EDITOR_MIN_WIDTH_IN_PIXELS,
                PANEL_CLIP_THRESHOLD_IN_PIXELS,
                PANEL_DEFAULT_WIDTH_IN_PIXELS,
            ),
        );
    }, [activeTabName]);

    return (
        <div className={"sidebar-tabs-container"}>
            <SidebarTabs ref={tabListRef}/>
            {TAB_NAME.NONE !== activeTabName && (
                <ResizeHandle
                    onHandleRelease={handleResizeHandleRelease}
                    onResize={handleResize}/>
            )}
        </div>
    );
};

export default Sidebar;
