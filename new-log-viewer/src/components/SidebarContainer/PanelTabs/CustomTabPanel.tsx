import React from "react";

import {
    DialogContent,
    DialogTitle,
    TabPanel,
    Typography,
} from "@mui/joy";


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
            <DialogTitle>
                <Typography
                    fontSize={14}
                    fontWeight={400}
                    level={"body-md"}
                    textTransform={"uppercase"}
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
