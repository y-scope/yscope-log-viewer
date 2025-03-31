import {
    IconButton,
    IconButtonProps,
    Tooltip,
    TooltipTypeMap,
} from "@mui/joy";
import { Check, Close } from "@mui/icons-material";

interface MenuBarToggleButtonProps extends IconButtonProps {
    tooltipPlacement?: TooltipTypeMap["props"]["placement"];
    isActive?: boolean;
    onIcon?: React.ReactNode;
    offIcon?: React.ReactNode;
}

/**
 * A toggle button for use in the menu bar.
 *
 * @param props
 * @param props.title Tooltip title.
 * @param props.tooltipPlacement Tooltip position.
 * @param props.onIcon Icon when active.
 * @param props.offIcon Icon when inactive.
 * @param props.rest Other IconButton props.
 * @return JSX.Element
 */
const MenuBarToggleButton = ({
                                 tooltipPlacement,
                                 title,
                                 isActive = false,
                                 onIcon = <Check />, // Default on state icon
                                 offIcon = <Close />, // Default off state icon
                                 ...rest
                             }: MenuBarToggleButtonProps) => {

    return (
        <Tooltip placement={tooltipPlacement ?? "bottom"} title={title}>
            <span>
                <IconButton
                    size="sm"
                    {...rest}
                >
                    {isActive ? onIcon : offIcon}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default MenuBarToggleButton;
