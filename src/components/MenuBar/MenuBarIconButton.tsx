import {
    IconButton,
    IconButtonProps,
    Tooltip,
} from "@mui/joy";


/**
 * An icon button for use in the menu bar.
 *
 * @param props
 * @param props.title Tooltip title.
 * @param props.rest
 * @return
 */
const MenuBarIconButton = ({title, ...rest}: IconButtonProps) => (
    <Tooltip
        arrow={true}
        placement={"bottom-start"}
        title={title}
    >
        <IconButton
            size={"sm"}
            {...rest}/>
    </Tooltip>
);

export default MenuBarIconButton;
