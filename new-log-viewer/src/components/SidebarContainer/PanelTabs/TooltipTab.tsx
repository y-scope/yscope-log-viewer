import {
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
    Icon: SvgIconComponent
}

/**
 * Renders a tooltip-wrapped tab button.
 *
 * @param props
 * @param props.tabName
 * @param props.Icon
 * @return
 */
const TooltipTab = ({tabName, Icon}: TooltipTabProps) => {
    return (
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
                value={tabName}
            >
                <Icon className={"sidebar-tab-button-icon"}/>
            </Tab>
        </Tooltip>
    );
};

export default TooltipTab;
