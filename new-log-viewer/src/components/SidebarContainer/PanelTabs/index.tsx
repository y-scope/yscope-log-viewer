import React, {
    forwardRef,
    useState,
} from "react";

import {
    TabList,
    Tabs,
} from "@mui/joy";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import {TAB_NAME} from "../../../typings/tab";
import SettingsModal from "../../modals/SettingsModal";
import FileInfoTab from "./FileInfoTab";
import TooltipTab from "./TooltipTab";


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
                        {tabName: TAB_NAME.FILE_INFO, Icon: InfoOutlinedIcon},
                    ].map(({tabName, Icon}) => (
                        <TooltipTab
                            Icon={Icon}
                            key={tabName}
                            tabName={tabName}/>
                    ))}
                    <div className={"sidebar-tab-list-spacing"}/>
                    <TooltipTab
                        Icon={SettingsOutlinedIcon}
                        tabName={TAB_NAME.SETTINGS}/>
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
