import {
    ListItemButton,
    Typography,
} from "@mui/joy";

import "./Result.css";


interface ResultProps {
    message: string,
    matchRange: [number, number]
}

/**
 * Displays a button containing a message, which highlights a specific range of text.
 *
 * @param props
 * @param props.message
 * @param props.matchRange A two-element array indicating the start and end indices of the substring
 * to be highlighted.
 * @return
 */
const Result = ({message, matchRange}: ResultProps) => {
    const [
        beforeMatch,
        match,
        afterMatch,
    ] = [
        message.slice(0, matchRange[0]),
        message.slice(...matchRange),
        message.slice(matchRange[1]),
    ];

    return (
        <ListItemButton className={"result-button"}>
            <Typography
                className={"result-text before-match"}
                level={"body-xs"}
            >
                {beforeMatch}
            </Typography>
            <Typography
                className={"result-text match"}
                level={"body-xs"}
                sx={{
                    backgroundColor: "warning.softBg",
                }}
            >
                {match}
            </Typography>
            <Typography
                className={"result-text after-match"}
                level={"body-xs"}
            >
                {afterMatch}
            </Typography>
        </ListItemButton>
    );
};

export default Result;
