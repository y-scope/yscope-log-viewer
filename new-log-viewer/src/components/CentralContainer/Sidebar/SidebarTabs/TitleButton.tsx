import {
    IconButton,
    IconButtonProps,
} from "@mui/joy";

import "./TitleButton.css";


/**
 * Renders an IconButton with an additional CSS class 'sidebar-tab-title-button'.
 *
 * @param props
 * @return
 */
const TitleButton = (props: IconButtonProps) => (
    <IconButton
        className={"sidebar-tab-title-button"}
        {...props}/>
);

export default TitleButton;
