import {
    IconButton,
    IconButtonProps,
    Tooltip,
} from "@mui/joy";


interface ToggleIconButtonProps extends IconButtonProps {
    isPressed: boolean;
    text: string;
    tooltipTitle: string;
}

/**
 * An icon button that can visually show icon pressed status.
 *
 * @param props
 * @param props.tooltipTitle
 * @param props.text
 * @param props.isPressed
 * @param props.rest
 * @return
 */
const ToggleIconButton = ({
    isPressed,
    text,
    tooltipTitle,
    ...rest
}: ToggleIconButtonProps) => {
    return (
        <Tooltip
            title={tooltipTitle}
        >
            <IconButton
                aria-pressed={isPressed}
                {...rest}
            >
                {text}
            </IconButton>
        </Tooltip>
    );
};

export default ToggleIconButton;
