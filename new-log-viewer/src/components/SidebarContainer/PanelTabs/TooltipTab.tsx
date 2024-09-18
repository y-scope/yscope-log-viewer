import {
    Divider,
    Tab,
    Tooltip,
} from "@mui/joy";

import {SvgIconComponent} from "@mui/icons-material";

import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../typings/tab";


interface TooltipTabProps {
    tabName: TAB_NAME,
    Icon: SvgIconComponent,
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
const TooltipTab = ({tabName, Icon, onTabButtonClick}: TooltipTabProps) => {
    const handleClick = () => {
        onTabButtonClick(tabName);
    };

    return (
        <>
            <Tooltip
                arrow={true}
                key={tabName}
                placement={"right"}
                title={TAB_DISPLAY_NAMES[tabName]}
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
            <Divider/>
        </>
    );
};

export default TooltipTab;
