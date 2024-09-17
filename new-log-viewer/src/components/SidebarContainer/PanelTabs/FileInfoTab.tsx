import {useContext} from "react";

import {
    DialogContent,
    DialogTitle,
    Divider,
    List,
    TabPanel,
} from "@mui/joy";

import AbcIcon from "@mui/icons-material/Abc";
import StorageIcon from "@mui/icons-material/Storage";

import {StateContext} from "../../../contexts/StateContextProvider";
import {formatSizeInBytes} from "../../../utils/units";
import CustomListItem from "../../CustomListItem";
import {TAB_NAME} from "./index";

import "./index.css";


/**
 * Display the file name and original size of the selected file.
 *
 * @return
 */
const FileInfoTab = () => {
    const {fileName, originalFileSizeInBytes} = useContext(StateContext);

    return (
        <TabPanel value={TAB_NAME.FILE_INFO}>
            <DialogTitle>File Info</DialogTitle>
            <DialogContent>
                <List>
                    <CustomListItem
                        content={fileName}
                        icon={<AbcIcon/>}
                        title={"File Info"}/>
                    <Divider/>
                    <CustomListItem
                        content={formatSizeInBytes(originalFileSizeInBytes)}
                        icon={<StorageIcon/>}
                        title={"Original Size"}/>
                </List>
            </DialogContent>
        </TabPanel>
    );
};


export default FileInfoTab;
