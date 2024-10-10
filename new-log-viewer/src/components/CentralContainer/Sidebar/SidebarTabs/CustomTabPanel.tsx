import React from "react";

import {
    DialogContent,
    DialogTitle,
    TabPanel,
    Typography,
} from "@mui/joy";

import "./CustomTabPanel.css";


interface CustomTabPanelProps {
    children: React.ReactNode,
    tabName: string,
    title: string,
}

/**
 * Renders a customized tab panel to be extended for displaying extra information in the sidebar.
 *
 * @param props
 * @param props.children
 * @param props.tabName
 * @param props.title
 * @return
 */
const CustomTabPanel = ({children, tabName, title}: CustomTabPanelProps) => {
    return (
        <TabPanel
            className={"sidebar-tab-panel"}
            value={tabName}
        >
            <DialogTitle className={"sidebar-tab-panel-title-container"}>
                <Typography
                    className={"sidebar-tab-panel-title"}
                    level={"body-md"}
                >
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
        </TabPanel>
    );
};


export default CustomTabPanel;
