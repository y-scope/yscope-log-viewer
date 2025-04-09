import {
    IconButton,
    IconButtonProps,
    Tooltip,
    TooltipTypeMap,
} from "@mui/joy";


interface MenuBarIconButtonProps extends IconButtonProps {
    tooltipPlacement?: TooltipTypeMap["props"]["placement"];
    tooltipTitle?: string;
}

/**
 * An icon button for use in the menu bar.
 *
 * @param props
 * @param props.tooltipTitle Tooltip title, to discern with native HTML tooltip.
 * @param props.tooltipPlacement
 * @param props.rest
 * @return
 */
const MenuBarIconButton = ({
    tooltipPlacement,
    tooltipTitle,
    ...rest
}: MenuBarIconButtonProps) => (
    <Tooltip
        placement={tooltipPlacement ?? "bottom"}
        title={tooltipTitle}
    >
        <span>
            <IconButton
                size={"sm"}
                {...rest}/>
        </span>
    </Tooltip>
);

export default MenuBarIconButton;
