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

import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../typings/tab";
import SettingsModal from "../../modals/SettingsModal";
import FileInfoTab from "./FileInfoTab";


interface PanelTabsProps {
    activeTabName: TAB_NAME,
    onActiveTabNameChange: (newValue: TAB_NAME) => void,
    onPanelTabOpen: () => void,
}

/**
 * Displays a set of tabs in a vertical orientation.
 *
 * @param tabListRef Reference object used to access the TabList DOM element.
 * @return
 */
const PanelTabs = forwardRef<HTMLDivElement, PanelTabsProps>((
    {
        activeTabName,
        onActiveTabNameChange,
        onPanelTabOpen,
    },
    tabListRef
) => {
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
                onActiveTabNameChange(value as TAB_NAME);
                onPanelTabOpen();
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
                            title={TAB_DISPLAY_NAMES[TAB_NAME.FILE_INFO]}
                            value={tabName}
                        >
                            {icon}
                        </Tab>
                    ))}
                    <div className={"sidebar-tab-list-spacing"}/>
                    <Tab
                        color={"neutral"}
                        title={TAB_DISPLAY_NAMES[TAB_NAME.SETTINGS]}
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
