import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import PanelTabs from "./PanelTabs";
import ResizeHandle from "./ResizeHandle";

import "./index.css";


interface SidebarContainerProps {
    children: React.ReactNode,
}

const RESIZE_HANDLE_WIDTH_IN_PIXEL = 3;
const PANEL_DEFAULT_WIDTH_IN_PIXEL = 300;
const PANEL_CLIP_THRESHOLD_IN_PIXEL = 80;
const PANEL_MAX_WIDTH_TO_WINDOW_WIDTH_RATIO = 0.8;


/**
 * Wraps a children with a sidebar component on the left.
 *
 * @param props
 * @param props.children
 * @return
 */
const SidebarContainer = ({children}: SidebarContainerProps) => {
    const [panelWidth, setPanelWidth] = useState<number>(PANEL_DEFAULT_WIDTH_IN_PIXEL);

    const tabListRef = useRef<HTMLDivElement>(null);

    const handleResize = useCallback((offset: number) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }
        if (tabListRef.current.clientWidth + PANEL_CLIP_THRESHOLD_IN_PIXEL > offset) {
            setPanelWidth(tabListRef.current.clientWidth);
        } else if (offset < window.innerWidth * PANEL_MAX_WIDTH_TO_WINDOW_WIDTH_RATIO) {
            setPanelWidth(offset + RESIZE_HANDLE_WIDTH_IN_PIXEL);
        }
    }, []);

    // On `panelWidth` change, update CSS variable `--ylv-panel-width`.
    useEffect(() => {
        document.body.style.setProperty("--ylv-panel-width", `${panelWidth}px`);
    }, [panelWidth]);

    return (
        <div className={"sidebar-container"}>
            <div className={"sidebar-tabs-container"}>
                <PanelTabs ref={tabListRef}/>
                <ResizeHandle onResize={handleResize}/>
            </div>
            <div className={"sidebar-children-container"}>
                {children}
            </div>
        </div>
    );
};

export default SidebarContainer;
