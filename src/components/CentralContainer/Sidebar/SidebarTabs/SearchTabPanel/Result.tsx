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

const SEARCH_RESULT_PREFIX_MAX_CHARACTERS = 20;

/**
 * Displays a button containing a message, which highlights a specific range of text.
 *
 * @param props
 * @param props.message
 * @param props.matchRange A two-element array indicating the start and end indices of the substring
 * to be highlighted.
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
                    {(SEARCH_RESULT_PREFIX_MAX_CHARACTERS < beforeMatch.length) && "..."}
                    {beforeMatch.slice(-SEARCH_RESULT_PREFIX_MAX_CHARACTERS)}
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
