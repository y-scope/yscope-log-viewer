import {
    IconButton,
    IconButtonProps,
    Tooltip,
    TooltipTypeMap,
} from "@mui/joy";

import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";


interface MenuBarToggleButtonProps extends IconButtonProps {
    tooltipPlacement?: TooltipTypeMap["props"]["placement"];
    tooltipTitle?: string;
    isActive?: boolean;
    onIcon?: React.ReactNode;
    offIcon?: React.ReactNode;
}

/**
 * A toggle button for use in the menu bar.
 *
 * @param props
 * @param props.tooltipTitle Tooltip title, to discern with native HTML tooltip.
 * @param props.tooltipPlacement Tooltip position.
 * @param props.onIcon Icon when active.
 * @param props.offIcon Icon when inactive.
 * @param props.rest Other IconButton props.
 * @param props.isActive
 * @return JSX.Element
 */
const MenuBarToggleButton = ({
    tooltipPlacement,
    tooltipTitle,
    isActive = false,
    onIcon = <Check/>,
    offIcon = <Close/>,
    ...rest
}: MenuBarToggleButtonProps) => {
    return (
        <Tooltip
            placement={tooltipPlacement ?? "bottom"}
            title={tooltipTitle}
        >
            <span>
                <IconButton
                    size={"sm"}
                    {...rest}
                >
                    {isActive ?
                        onIcon :
                        offIcon}
                </IconButton>
            </span>
        </Tooltip>
    );
};


export default MenuBarToggleButton;
