import {
    Ref,
    Suspense,
    useCallback,
    useMemo,
} from "react";

import {
    Skeleton,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    Tooltip,
} from "@mui/joy";
import SvgIcon from "@mui/material/SvgIcon";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import pluginRegistry from "../../../../services/PluginRegistry";
import pluginContext from "../../../../services/PluginRegistry/PluginContext";
import useUiStore from "../../../../stores/uiStore";
import {TAB_NAME} from "../../../../typings/tab";
import {openInNewTab} from "../../../../utils/url";
import FileInfoTabPanel from "./FileInfoTabPanel";
import SearchTabPanel from "./SearchTabPanel";
import SettingsTabPanel from "./SettingsTabPanel";
import TabButton from "./TabButton";

import "./index.css";


const DOCUMENTATION_URL = "https://docs.yscope.com/yscope-log-viewer/main/user-guide/index.html";

/**
 * Lists information for each tab.
 */
const TABS_INFO_LIST: Readonly<Array<{
    tabName: TAB_NAME;
    Icon: typeof SvgIcon;
}>> = Object.freeze([
    {tabName: TAB_NAME.FILE_INFO, Icon: InfoOutlinedIcon},
    {tabName: TAB_NAME.SEARCH, Icon: SearchIcon},
]);

interface SidebarTabsProps {
    ref: Ref<HTMLDivElement>;
}

/**
 * Displays a set of tabs in a vertical orientation.
 *
 * @param props
 * @param props.ref Reference object used to access the TabList DOM element.
 * @return
 */
const SidebarTabs = ({ref}: SidebarTabsProps) => {
    const activeTabName = useUiStore((state) => state.activeTabName);

    const pluginPanels = useMemo(
        () => pluginRegistry.getSidebarPanelProviders()
            .filter((panel) => !panel.shouldShow || panel.shouldShow(pluginContext)),
        []
    );

    const handleTabButtonClick = useCallback((tabName: string) => {
        switch (tabName as TAB_NAME) {
            case TAB_NAME.DOCUMENTATION:
                openInNewTab(DOCUMENTATION_URL);
                break;
            default: {
                const newTabName = (activeTabName === tabName) ?
                    TAB_NAME.NONE :
                    tabName;
                const {setActiveTabName} = useUiStore.getState();
                setActiveTabName(newTabName);
            }
        }
    }, [activeTabName]);

    return (
        <Tabs
            className={"sidebar-tabs"}
            orientation={"vertical"}
            value={activeTabName}
            variant={"plain"}
        >
            <TabList
                ref={ref}
                size={"lg"}
            >
                {TABS_INFO_LIST.map(({tabName, Icon}) => (
                    <TabButton
                        Icon={Icon}
                        key={tabName}
                        tabName={tabName}
                        onTabButtonClick={handleTabButtonClick}/>
                ))}

                {/* Plugin tabs appear after built-in tabs and before the spacer. */}
                {pluginPanels.map((panel) => (
                    <Tooltip
                        key={panel.id}
                        placement={"right"}
                        title={panel.label}
                    >
                        <Tab
                            className={"sidebar-tab-button"}
                            color={"neutral"}
                            indicatorPlacement={"left"}
                            value={panel.id}
                            slotProps={{
                                root: {
                                    onClick: () => {
                                        handleTabButtonClick(panel.id);
                                    },
                                },
                            }}
                        >
                            {panel.icon ?
                                <panel.icon className={"sidebar-tab-button-icon"}/> :
                                null}
                        </Tab>
                    </Tooltip>
                ))}

                {/* Forces the help and settings tabs to the bottom of the sidebar. */}
                <div className={"sidebar-tab-list-spacing"}/>

                <TabButton
                    Icon={HelpOutlineIcon}
                    tabName={TAB_NAME.DOCUMENTATION}
                    onTabButtonClick={handleTabButtonClick}/>

                <TabButton
                    Icon={SettingsOutlinedIcon}
                    tabName={TAB_NAME.SETTINGS}
                    onTabButtonClick={handleTabButtonClick}/>
            </TabList>
            <FileInfoTabPanel/>
            <SearchTabPanel/>
            <SettingsTabPanel/>

            {/* Plugin tab panels */}
            {pluginPanels.map((panel) => (
                <TabPanel
                    className={"sidebar-tab-panel"}
                    key={panel.id}
                    value={panel.id}
                >
                    <Suspense fallback={<Skeleton/>}>
                        <panel.component/>
                    </Suspense>
                </TabPanel>
            ))}
        </Tabs>
    );
};

export default SidebarTabs;
