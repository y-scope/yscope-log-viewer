import React from "react";

import {
    ListItem,
    ListItemContent,
    ListItemDecorator,
    Typography,
} from "@mui/joy";


interface CustomListItemProps {
    content: string,
    icon: React.ReactNode,
    title: string
}

/**
 * Renders a custom list item with an icon, a title and a context text.
 *
 * @param props
 * @param props.content
 * @param props.icon
 * @param props.title
 * @return
 */
const CustomListItem = ({content, icon, title}: CustomListItemProps) => (
    <ListItem>
        <ListItemDecorator>
            {icon}
        </ListItemDecorator>
        <ListItemContent>
            <Typography level={"title-sm"}>
                {title}
            </Typography>
            <Typography
                level={"body-sm"}
            >
                {content}
            </Typography>
        </ListItemContent>
    </ListItem>
);

export default CustomListItem;
