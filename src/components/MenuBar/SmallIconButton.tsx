import {IconButton} from "@mui/joy";


/**
 * A small JoyUI IconButton.
 *
 * @param props The props for IconButton.
 * @return
 */
const SmallIconButton = (props: React.ComponentProps<typeof IconButton>) => (
    <IconButton
        size={"sm"}
        {...props}/>
);

export default SmallIconButton;
