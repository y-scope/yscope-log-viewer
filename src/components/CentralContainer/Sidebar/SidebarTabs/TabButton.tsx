import {
    Tab,
    Tooltip,
} from "@mui/joy";
import SvgIcon from "@mui/material/SvgIcon";

import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../typings/tab";

import "./TabButton.css";


interface TabButtonProps {
    tabName: TAB_NAME,
    Icon: typeof SvgIcon,
    onTabButtonClick: (tabName: TAB_NAME) => void
}

/**
 * Renders a tooltip-wrapped tab button.
 *
 * @param props
 * @param props.tabName
 * @param props.Icon
 * @param props.onTabButtonClick
 * @return
 */
const TabButton = ({tabName, Icon, onTabButtonClick}: TabButtonProps) => {
    const handleClick = () => {
        onTabButtonClick(tabName);
    };

    return (
        <Tooltip
            arrow={true}
            key={tabName}
            placement={"right"}
            title={TAB_DISPLAY_NAMES[tabName]}
            variant={"outlined"}
        >
            <Tab
                className={"sidebar-tab-button"}
                color={"neutral"}
                indicatorPlacement={"left"}
                slotProps={{root: {onClick: handleClick}}}
                value={tabName}
            >
                <Icon className={"sidebar-tab-button-icon"}/>
            </Tab>
        </Tooltip>
    );
};

export default TabButton;
