import {
    IconButton,
    IconButtonProps,
} from "@mui/joy";

import "./PanelTitleButton.css";


/**
 * Renders an IconButton with an additional CSS class 'sidebar-tab-title-button'.
 *
 * @param props
 * @return
 */
const PanelTitleButton = (props: IconButtonProps) => (
    <IconButton
        className={"tab-panel-title-button"}
        {...props}/>
);

export default PanelTitleButton;
