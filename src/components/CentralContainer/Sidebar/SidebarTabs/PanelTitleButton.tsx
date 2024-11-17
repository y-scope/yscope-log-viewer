import {
    IconButton,
    IconButtonProps,
} from "@mui/joy";

import "./PanelTitleButton.css";


/**
 * Renders an IconButton for use in sidebar tab titles.
 *
 * @param props
 * @return
 */
const PanelTitleButton = (props: IconButtonProps) => {
    const {className, ...rest} = props;
    return (
        <IconButton
            className={`tab-panel-title-button ${className ?? ""}`}
            {...rest}/>
    );
};


export default PanelTitleButton;
