import {
    forwardRef,
    useContext,
} from "react";

import {
    TabList,
    Tabs,
} from "@mui/joy";
import SvgIcon from "@mui/material/SvgIcon";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import {StateContext} from "../../../../contexts/StateContextProvider";
import {TAB_NAME} from "../../../../typings/tab";
import {openInNewTab} from "../../../../utils/url";
import SettingsModal from "../../../modals/SettingsModal";
import FileInfoTabPanel from "./FileInfoTabPanel";
import SearchTabPanel from "./SearchTabPanel";
import TabButton from "./TabButton";

import "./index.css";


const DOCUMENTATION_URL = "https://docs.yscope.com/yscope-log-viewer/main/user-guide/index.html";

/**
 * Lists information for each tab.
 */
const TABS_INFO_LIST: Readonly<Array<{
    tabName: TAB_NAME,
    Icon: typeof SvgIcon,
}>> = Object.freeze([
    {tabName: TAB_NAME.FILE_INFO, Icon: InfoOutlinedIcon},
    {tabName: TAB_NAME.SEARCH, Icon: SearchIcon},
]);

interface SidebarTabsProps {
    activeTabName: TAB_NAME,
    onActiveTabNameChange: (newValue: TAB_NAME) => void,
}

/**
 * Displays a set of tabs in a vertical orientation.
 *
 * @param tabListRef Reference object used to access the TabList DOM element.
 * @return
 */
const SidebarTabs = forwardRef<HTMLDivElement, SidebarTabsProps>((
    {
        activeTabName,
        onActiveTabNameChange,
    },
    tabListRef
) => {
    const {isSettingsModalOpen, setIsSettingsModalOpen} = useContext(StateContext);

    const handleSettingsModalClose = () => {
        setIsSettingsModalOpen(false);
    };

    const handleTabButtonClick = (tabName: TAB_NAME) => {
        switch (tabName) {
            case TAB_NAME.SETTINGS:
                setIsSettingsModalOpen(true);
                break;
            case TAB_NAME.DOCUMENTATION:
                openInNewTab(DOCUMENTATION_URL);
                break;
            default:
                onActiveTabNameChange(tabName);
        }
    };

    return (
        <>
            <Tabs
                className={"sidebar-tabs"}
                orientation={"vertical"}
                value={activeTabName}
                variant={"plain"}
            >
                <TabList
                    ref={tabListRef}
                    size={"lg"}
                >
                    {TABS_INFO_LIST.map(({tabName, Icon}) => (
                        <TabButton
                            Icon={Icon}
                            key={tabName}
                            tabName={tabName}
                            onTabButtonClick={handleTabButtonClick}/>
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
            </Tabs>
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleSettingsModalClose}/>
        </>
    );
});

SidebarTabs.displayName = "SidebarTabs";
export default SidebarTabs;
