import {
    IconButton,
    IconButtonProps,
    Tooltip,
    TooltipTypeMap,
} from "@mui/joy";


interface MenuBarIconButtonProps extends IconButtonProps {
    tooltipPlacement?: TooltipTypeMap["props"]["placement"];
}

/**
 * An icon button for use in the menu bar.
 *
 * @param props
 * @param props.title Tooltip title.
 * @param props.tooltipPlacement
 * @param props.rest
 * @return
 */
const MenuBarIconButton = ({
    tooltipPlacement,
    title,
    ...rest
}: MenuBarIconButtonProps) => (
    <Tooltip
        placement={tooltipPlacement ?? "bottom"}
        title={title}
    >
        <span>
            <IconButton
                size={"sm"}
                {...rest}/>
        </span>
    </Tooltip>
);

export default MenuBarIconButton;
