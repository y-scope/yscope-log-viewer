import React, {
    useContext,
    useState,
} from "react";

import {
    AccordionGroup,
    Box,
    IconButton,
    LinearProgress,
    Stack,
    Textarea,
    Tooltip,
} from "@mui/joy";

import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import {StateContext} from "../../../../../contexts/StateContextProvider";
import {
    QUERY_PROGRESS_VALUE_MAX,
    QueryArgs,
} from "../../../../../typings/query";
import {UI_ELEMENT} from "../../../../../typings/states";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import {isDisabled} from "../../../../../utils/states";
import CustomTabPanel from "../CustomTabPanel";
import PanelTitleButton from "../PanelTitleButton";
import ResultsGroup from "./ResultsGroup";

import "./index.css";


/**
 * Displays a panel for submitting queries and viewing query results.
 *
 * @return
 */
// eslint-disable-next-line max-lines-per-function
const SearchTabPanel = () => {
    const {queryProgress, queryResults, startQuery, uiState} = useContext(StateContext);
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [queryString, setQueryString] = useState<string>("");
    const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(false);
    const [isRegex, setIsRegex] = useState<boolean>(false);

    const handleCollapseAllButtonClick = () => {
        setIsAllExpanded((v) => !v);
    };

    const handleQuerySubmit = (newArgs: Partial<QueryArgs>) => {
        startQuery({
            isCaseSensitive: isCaseSensitive,
            isRegex: isRegex,
            queryString: queryString,
            ...newArgs,
        });
    };

    const handleQueryInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQueryString(ev.target.value);
        handleQuerySubmit({queryString: ev.target.value});
    };

    const handleCaseButtonPressed = () => {
        setIsCaseSensitive(!isCaseSensitive);
        handleQuerySubmit({
            isCaseSensitive: isCaseSensitive,
            isRegex: isRegex,
        });
    };

    const handleRegexButtonPressed = () => {
        setIsRegex(!isRegex);
        handleQuerySubmit({
            isCaseSensitive: isCaseSensitive,
            isRegex: isRegex,
        });
    };

    const isQueryInputBoxDisabled = isDisabled(uiState, UI_ELEMENT.QUERY_INPUT_BOX);

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SEARCH}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SEARCH]}
            titleButtons={
                <PanelTitleButton
                    title={isAllExpanded ?
                        "Collapse all" :
                        "Expand all"}
                    onClick={handleCollapseAllButtonClick}
                >
                    {isAllExpanded ?
                        <UnfoldLessIcon/> :
                        <UnfoldMoreIcon/>}
                </PanelTitleButton>
            }
        >
            <Box className={"search-tab-container"}>
                <div className={"query-input-box-with-progress"}>
                    <Textarea
                        className={"query-input-box"}
                        maxRows={7}
                        placeholder={"Search"}
                        size={"sm"}
                        endDecorator={
                            <Stack
                                direction={"row"}
                                spacing={0.25}
                            >
                                <Tooltip title={"Match case"}>
                                    <span>
                                        <IconButton
                                            aria-pressed={String(isCaseSensitive)}
                                            className={"query-option-button"}
                                            disabled={isQueryInputBoxDisabled}
                                            size={"sm"}
                                            variant={"plain"}
                                            sx={(theme) => ({
                                                "&[aria-pressed=\"true\"]": {
                                                    ...theme.variants.outlinedActive.neutral,
                                                    borderColor:
                                                    theme.vars.palette.neutral.outlinedHoverBorder,
                                                },
                                            })}
                                            onClick={handleCaseButtonPressed}
                                        >
                                            Aa
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title={"Use regular expression"}>
                                    <span>
                                        <IconButton
                                            aria-pressed={String(isRegex)}
                                            className={"query-option-button"}
                                            disabled={isQueryInputBoxDisabled}
                                            size={"sm"}
                                            variant={"plain"}
                                            sx={(theme) => ({
                                                "&[aria-pressed=\"true\"]": {
                                                    ...theme.variants.outlinedActive.neutral,
                                                    borderColor:
                                                    theme.vars.palette.neutral.outlinedHoverBorder,
                                                },
                                            })}
                                            onClick={handleRegexButtonPressed}
                                        >
                                            .*
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        }
                        slotProps={{
                            textarea: {
                                className: "query-input-box-textarea",
                                disabled: isQueryInputBoxDisabled,
                            },
                            endDecorator: {className: "query-input-box-end-decorator"},
                        }}
                        onChange={handleQueryInputChange}/>
                    <LinearProgress
                        className={"query-input-box-linear-progress"}
                        determinate={true}
                        thickness={4}
                        value={queryProgress * 100}
                        color={QUERY_PROGRESS_VALUE_MAX === queryProgress ?
                            "success" :
                            "primary"}/>
                </div>
                <AccordionGroup
                    className={"query-results"}
                    disableDivider={true}
                    size={"sm"}
                >
                    {Array.from(queryResults.entries()).map(([pageNum, results]) => (
                        <ResultsGroup
                            isAllExpanded={isAllExpanded}
                            key={`${pageNum}-${results.length}`}
                            pageNum={pageNum}
                            results={results}/>
                    ))}
                </AccordionGroup>
            </Box>
        </CustomTabPanel>
    );
};


export default SearchTabPanel;
