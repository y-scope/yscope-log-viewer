import React, {
    forwardRef,
    useState,
} from "react";

import {
    Tab,
    TabList,
    Tabs,
} from "@mui/joy";

import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";

import SettingsModal from "../../modals/SettingsModal";
import FileInfoTab from "./FileInfoTab";


enum TAB_NAME {
    FILE_INFO = "fileInfo",
    SETTINGS = "settings",
}

/**
 * Displays a set of tabs in a vertical orientation.
 *
 * @param tabListRef Reference object used to access the TabList DOM element.
 * @return
 */
const PanelTabs = forwardRef<HTMLDivElement>((_, tabListRef) => {
    const [activeTabName, setActiveTabName] = useState<TAB_NAME>(TAB_NAME.FILE_INFO);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

    const handleSettingsModalClose = () => {
        setIsSettingsModalOpen(false);
    };

    const handleTabChange = (__: React.SyntheticEvent | null, value: number | string | null) => {
        switch (value) {
            case TAB_NAME.SETTINGS:
                setIsSettingsModalOpen(true);
                break;
            default:
                setActiveTabName(value as TAB_NAME);
        }
    };

    return (
        <>
            <Tabs
                className={"sidebar-tabs"}
                orientation={"vertical"}
                value={activeTabName}
                variant={"plain"}
                onChange={handleTabChange}
            >
                <TabList
                    ref={tabListRef}
                    size={"lg"}
                >
                    {[
                        {tabName: TAB_NAME.FILE_INFO, icon: <InfoIcon/>},
                    ].map(({tabName, icon}) => (
                        <Tab
                            color={"neutral"}
                            key={tabName}
                            value={tabName}
                        >
                            {icon}
                        </Tab>
                    ))}
                    <div className={"sidebar-tab-list-spacing"}/>
                    <Tab
                        color={"neutral"}
                        value={TAB_NAME.SETTINGS}
                    >
                        <SettingsIcon/>
                    </Tab>
                </TabList>
                <FileInfoTab/>
            </Tabs>
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleSettingsModalClose}/>
        </>
    );
});

PanelTabs.displayName = "PanelTabs";
export default PanelTabs;
export {TAB_NAME};
