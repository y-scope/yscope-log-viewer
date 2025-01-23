import {
    IconButton,
    IconButtonProps,
    Tooltip,
} from "@mui/joy";

import "./PanelTitleButton.css";


/**
 * Renders an IconButton for use in sidebar tab titles.
 *
 * @param props
 * @param props.className
 * @param props.title
 * @param props.rest
 * @return
 */
const PanelTitleButton = ({
    className,
    title,
    ...rest
}: IconButtonProps) => (
    <Tooltip title={title}>
        <span>
            <IconButton
                className={`tab-panel-title-button ${className ?? ""}`}
                {...rest}/>
        </span>
    </Tooltip>
);


export default PanelTitleButton;
