import {
    IconButton,
    IconButtonProps,
    Tooltip,
} from "@mui/joy";


interface ToggleIconButtonProps extends IconButtonProps {
    isChecked: boolean;
    children: React.ReactNode;
    tooltipTitle: string;
}

/**
 * An icon button that can visually show icon pressed status.
 *
 * @param props
 * @param props.children
 * @param props.isChecked
 * @param props.tooltipTitle
 * @param props.rest
 * @return
 */
const ToggleIconButton = ({
    children,
    isChecked,
    tooltipTitle,
    ...rest
}: ToggleIconButtonProps) => {
    return (
        <Tooltip
            title={tooltipTitle}
        >
            <span>
                <IconButton
                    aria-pressed={isChecked}
                    {...rest}
                >
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default ToggleIconButton;
