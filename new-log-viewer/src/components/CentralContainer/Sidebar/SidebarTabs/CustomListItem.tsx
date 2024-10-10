import React from "react";

import {
    ListItem,
    ListItemContent,
    ListItemDecorator,
    Typography,
    TypographyProps,
} from "@mui/joy";


interface CustomListItemProps {
    content: string,
    icon: React.ReactNode,
    slotProps?: {
        content?: TypographyProps
    },
    title: string
}

/**
 * Renders a custom list item with an icon, a title and a context text.
 *
 * @param props
 * @param props.content
 * @param props.icon
 * @param props.slotProps
 * @param props.title
 * @return
 */
const CustomListItem = ({content, icon, slotProps, title}: CustomListItemProps) => (
    <ListItem>
        <ListItemDecorator>
            {icon}
        </ListItemDecorator>
        <ListItemContent>
            <Typography level={"title-sm"}>
                {title}
            </Typography>
            <Typography
                {...slotProps?.content}
                level={"body-sm"}
            >
                {content}
            </Typography>
        </ListItemContent>
    </ListItem>
);

export default CustomListItem;
