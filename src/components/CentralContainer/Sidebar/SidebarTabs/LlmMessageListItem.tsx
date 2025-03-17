import Markdown from "react-markdown";

import {
    ListItem,
    ListItemContent,
    Typography,
    TypographyProps,
} from "@mui/joy";
import rehypeSanitize from "rehype-sanitize";

import "./LlmMessageListItem.css";
import "github-markdown-css";


interface LlmMessageListItemProps {
    content: string;
    isRequest: boolean;
    isStreaming: boolean;
    slotProps?: {
        content?: TypographyProps;
    };
}

const LLM_REQUEST_STYLES = {
    backgroundColor: "var(--bgColor-muted)",
    borderRadius: "2em",
    float: "right",
    marginBottom: "1em",
    padding: "1em",
    width: "70%",
};

/**
 * Renders a custom list item with an icon, a title and a context text.
 *
 * @param props
 * @param props.content
 * @param props.slotProps
 * @param props.isRequest
 * @param props.isStreaming
 * @return
 */
const LlmMessageListItem = ({content,
    isRequest,
    isStreaming,
    slotProps}: LlmMessageListItemProps) => {
// eslint-disable-next-line no-warning-comments
// TODO: Name dark/light theme explicitly in `github-markdown-css`.
    return (
        <ListItem sx={{alignItems: "start"}}>
            <ListItemContent>
                <Typography
                    {...slotProps?.content}
                    className={"markdown-body llm-markdown"}
                    component={"div"}
                    level={"body-sm"}
                    sx={{fontFamily: "var(--joy-fontFamily-body), 'Noto Color Emoji'",
                        ...(isRequest ?
                            LLM_REQUEST_STYLES :
                            null)}}
                >
                    <Markdown
                        rehypePlugins={[rehypeSanitize]}
                    >
                        {content + (isStreaming ?
                            "\u26AB" :
                            "")}
                    </Markdown>
                </Typography>
            </ListItemContent>
        </ListItem>
    );
};

export default LlmMessageListItem;
