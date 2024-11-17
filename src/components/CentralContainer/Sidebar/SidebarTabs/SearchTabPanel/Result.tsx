import {
    ListItemButton,
    Typography,
} from "@mui/joy";

import {updateWindowUrlHashParams} from "../../../../../contexts/UrlContextProvider";

import "./Result.css";


interface ResultProps {
    logEventNum: number,
    message: string,
    matchRange: [number, number]
}

const QUERY_RESULT_PREFIX_MAX_CHARACTERS = 20;

/**
 * Renders a query result as a button with a message, highlighting the first matching text range.
 *
 * @param props
 * @param props.message
 * @param props.matchRange A two-element array [begin, end) representing the indices of the matching
 * text range.
 * @param props.logEventNum
 * @return
 */
const Result = ({logEventNum, message, matchRange}: ResultProps) => {
    const [
        beforeMatch,
        match,
        afterMatch,
    ] = [
        message.slice(0, matchRange[0]),
        message.slice(...matchRange),
        message.slice(matchRange[1]),
    ];
    const handleResultButtonClick = () => {
        updateWindowUrlHashParams({logEventNum});
    };

    return (
        <ListItemButton
            className={"result-button"}
            onClick={handleResultButtonClick}
        >
            <Typography
                className={"result-button-text"}
                level={"body-sm"}
            >
                <span>
                    {(QUERY_RESULT_PREFIX_MAX_CHARACTERS < beforeMatch.length) && "..."}
                    {beforeMatch.slice(-QUERY_RESULT_PREFIX_MAX_CHARACTERS)}
                </span>
                <Typography
                    className={"result-button-text"}
                    level={"body-sm"}
                    sx={{backgroundColor: "warning.softBg"}}
                >
                    {match}
                </Typography>
                {afterMatch}
            </Typography>
        </ListItemButton>
    );
};


export default Result;
