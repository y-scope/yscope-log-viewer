import React, {useMemo} from "react";

import {Table} from "@mui/joy";

import InfoIcon from "@mui/icons-material/Info";

import useLogFileStore from "../../../../../stores/logFileStore";
import {flattenObject} from "../../../../../utils/js";
import CustomListItem from "../CustomListItem";

import "./MetadataListItem.css";


/**
 * Renders a list item that displays metadata information of the currently selected log file.
 *
 * @return
 */
const MetadataListItem = () => {
    const metadata = useLogFileStore((state) => state.metadata);

    const flattenedMetadata = useMemo(() => {
        if (null === metadata) {
            return [];
        }

        return flattenObject(metadata);
    }, [metadata]);

    let content: string | React.ReactNode;
    if (null === metadata) {
        content = "Loading...";
    } else if (0 >= flattenedMetadata.length) {
        content = "No metadata available.";
    } else {
        content = (
            <Table
                className={"metadata-table"}
                size={"sm"}
                stripe={"odd"}
            >
                <tbody>
                    {flattenedMetadata.map(([key, value]) => (
                        <tr key={key}>
                            <td>
                                {key}
                            </td>
                            <td className={"metadata-value"}>
                                {String(value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    }

    return (
        <CustomListItem
            content={content}
            icon={<InfoIcon/>}
            title={"Metadata"}/>
    );
};


export default MetadataListItem;
