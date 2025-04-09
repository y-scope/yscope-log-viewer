import {
    IconButton,
    IconButtonProps,
    Tooltip,
    TooltipTypeMap,
} from "@mui/joy";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";


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
const StatusBarToggleButton = ({
    tooltipPlacement,
    tooltipTitle,
    isActive = false,
    onIcon = <CheckIcon/>,
    offIcon = <CloseIcon/>,
    ...rest
}: MenuBarToggleButtonProps) => {
    return (
        <Tooltip
            title={tooltipTitle}
            {... tooltipPlacement && {placement: tooltipPlacement}}
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


export default StatusBarToggleButton;
