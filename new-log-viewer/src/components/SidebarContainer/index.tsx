import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {TAB_NAME} from "../../typings/tab";
import PanelTabs from "./PanelTabs";
import ResizeHandle from "./ResizeHandle";

import "./index.css";


const PANEL_DEFAULT_WIDTH_IN_PIXEL = 300;
const PANEL_CLIP_THRESHOLD_IN_PIXEL = 80;
const PANEL_MAX_WIDTH_TO_WINDOW_WIDTH_RATIO = 0.8;

interface SidebarContainerProps {
    children: React.ReactNode,
}

/**
 * Wraps a children with a sidebar component on the left.
 *
 * @param props
 * @param props.children
 * @return
 */
const SidebarContainer = ({children}: SidebarContainerProps) => {
    const [activeTabName, setActiveTabName] = useState<TAB_NAME>(TAB_NAME.FILE_INFO);
    const [panelWidth, setPanelWidth] = useState<number>(PANEL_DEFAULT_WIDTH_IN_PIXEL);

    const tabListRef = useRef<HTMLDivElement>(null);

    // handlePanelTabOpen
    const handlePanelTabOpen = useCallback(() => {
        setPanelWidth(PANEL_DEFAULT_WIDTH_IN_PIXEL);
    }, []);

    const handlePanelTabClose = () => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }
        setActiveTabName(TAB_NAME.NONE);
        setPanelWidth(tabListRef.current.clientWidth);
    };

    const handleResize = useCallback((offset: number) => {
        if (null === tabListRef.current) {
            console.error("Unexpected null tabListRef.current");

            return;
        }
        if (tabListRef.current.clientWidth + PANEL_CLIP_THRESHOLD_IN_PIXEL > offset) {
            handlePanelTabClose();
        } else if (offset < window.innerWidth * PANEL_MAX_WIDTH_TO_WINDOW_WIDTH_RATIO) {
            setPanelWidth(offset);
        }
    }, []);

    // On `panelWidth` change, update CSS variable `--ylv-panel-width`.
    useEffect(() => {
        document.body.style.setProperty("--ylv-panel-width", `${panelWidth}px`);
    }, [panelWidth]);

    return (
        <div className={"sidebar-container"}>
            <div className={"sidebar-tabs-container"}>
                <PanelTabs
                    activeTabName={activeTabName}
                    ref={tabListRef}
                    onActiveTabNameChange={setActiveTabName}
                    onPanelTabOpen={handlePanelTabOpen}/>
                <ResizeHandle onResize={handleResize}/>
            </div>
            <div className={"sidebar-children-container"}>
                {children}
            </div>
        </div>
    );
};

export default SidebarContainer;
