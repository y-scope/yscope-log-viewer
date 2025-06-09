import React from "react";
import {JSONTree} from "react-json-tree";

import {useColorScheme} from "@mui/joy";

import InfoIcon from "@mui/icons-material/Info";

import useLogFileStore from "../../../../../stores/logFileStore";
import {Nullable} from "../../../../../typings/common";
import CustomListItem from "../CustomListItem";


/**
 * Renders a list item that displays metadata information of the currently selected log file.
 *
 * @return
 */
const MetadataListItem = () => {
    const {mode, systemMode} = useColorScheme();
    const metadata = useLogFileStore((state) => state.metadata);

    let content: React.ReactNode = "Loading...";
    let icon: Nullable<React.ReactNode> = <InfoIcon/>;
    if (null !== metadata) {
        if (0 < Object.keys(metadata).length) {
            const enabledMode = "system" === mode ?
                systemMode :
                mode;

            content = (
                <JSONTree
                    data={metadata}
                    hideRoot={true}
                    invertTheme={"light" === enabledMode}
                    shouldExpandNodeInitially={() => true}
                    sortObjectKeys={true}
                    theme={"chalk"}/>
            );

            // Hide the icon if metadata is available.
            icon = null;
        } else {
            content = "No metadata available.";
        }
    }

    return (
        <CustomListItem
            content={content}
            icon={icon}
            title={"Metadata"}/>
    );
};


export default MetadataListItem;
