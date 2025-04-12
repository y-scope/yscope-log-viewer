import React from "react";

import {
    IconButton,
    IconButtonProps,
    Tooltip,
    TooltipTypeMap,
} from "@mui/joy";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";


interface StatusBarToggleButtonProps extends IconButtonProps {
    icons?: {
        active?: React.ReactNode;
        inactive?: React.ReactNode;
    };
    isActive: boolean;
    onIcon?: React.ReactNode;
    offIcon?: React.ReactNode;
    tooltipPlacement?: TooltipTypeMap["props"]["placement"];
    tooltipTitle?: string;
}

/**
 * A toggle button for use in the status bar.
 *
 * @param props
 * @param props.icons Icons to use for the active and inactive states.
 * @param props.isActive
 * @param props.tooltipPlacement Tooltip position.
 * @param props.tooltipTitle Tooltip title, to discern with native HTML tooltip.
 * @param props.rest Other IconButton props.
 * @return
 */
const StatusBarToggleButton = ({
    icons = {
        active: <CheckIcon/>,
        inactive: <CloseIcon/>,
    },
    isActive = false,
    tooltipPlacement,
    tooltipTitle,
    ...rest
}: StatusBarToggleButtonProps) => {
    return (
        <Tooltip
            title={tooltipTitle}
            {... tooltipPlacement && {placement: tooltipPlacement}}
        >
            <span>
                <IconButton
                    size={"sm"}
                    variant={"outlined"}
                    aria-pressed={isActive ?
                        "true" :
                        "false"}
                    {...rest}
                >
                    {isActive ?
                        icons.active :
                        icons.inactive}
                </IconButton>
            </span>
        </Tooltip>
    );
};


export default StatusBarToggleButton;
