import React from "react";

import {
    ListItem,
    ListItemContent,
    Typography,
    TypographyProps,
} from "@mui/joy";

import "./CustomListItem.css";


interface CustomListItemProps {
    content: string | React.ReactNode;
    icon: React.ReactNode;
    slotProps?: {
        content?: TypographyProps;
    };
    title: string;
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
    <ListItem className={"custom-list-item"}>
        <ListItemContent>
            <Typography
                level={"title-sm"}
                startDecorator={icon}
            >
                {title}
            </Typography>
            {
                "string" === typeof content ?
                    <Typography
                        {...slotProps?.content}
                        level={"body-sm"}
                    >
                        {content}
                    </Typography> :
                    <div>
                        {content}
                    </div>
            }
        </ListItemContent>
    </ListItem>
);


export default CustomListItem;
