import {useContext} from "react";

import {
    Divider,
    List,
} from "@mui/joy";

import AbcIcon from "@mui/icons-material/Abc";
import StorageIcon from "@mui/icons-material/Storage";

import {StateContext} from "../../../contexts/StateContextProvider";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../typings/tab";
import {formatSizeInBytes} from "../../../utils/units";
import CustomListItem from "../../CustomListItem";
import CustomTabPanel from "./CustomTabPanel";

import "./index.css";


/**
 * Display the file name and original size of the selected file.
 *
 * @return
 */
const FileInfoTab = () => {
    const {fileName, originalFileSizeInBytes} = useContext(StateContext);

    return (
        <CustomTabPanel
            tabName={TAB_NAME.FILE_INFO}
            title={TAB_DISPLAY_NAMES[TAB_NAME.FILE_INFO]}
        >
            <List>
                <CustomListItem
                    content={fileName}
                    icon={<AbcIcon/>}
                    title={"Name"}/>
                <Divider/>
                <CustomListItem
                    content={formatSizeInBytes(originalFileSizeInBytes)}
                    icon={<StorageIcon/>}
                    title={"Original Size"}/>
            </List>
        </CustomTabPanel>
    );
};

export default FileInfoTab;
