import React from "react";

import {
    ListItem,
    ListItemContent,
    Typography,
    TypographyProps,
} from "@mui/joy";

import "./CustomListItem.css";


type Content = string | React.ReactNode;

interface CustomListItemProps<C extends Content> {
    content: C;
    icon: React.ReactNode;
    slotProps?: {
        content?: C extends string ?
            TypographyProps :
            React.HTMLAttributes<HTMLDivElement>;
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
const CustomListItem = <C extends Content>({
    content,
    icon,
    slotProps,
    title,
}: CustomListItemProps<C>) => (
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
                        level={"body-sm"}
                        {...slotProps?.content as TypographyProps}
                    >
                        {content}
                    </Typography> :
                    <div {...slotProps?.content as React.HTMLAttributes<HTMLDivElement>}>
                        {content}
                    </div>
            }
        </ListItemContent>
    </ListItem>
);


export default CustomListItem;
