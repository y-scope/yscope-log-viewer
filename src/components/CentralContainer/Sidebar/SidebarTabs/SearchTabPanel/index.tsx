import React, {
    useContext,
    useState,
} from "react";

import {
    AccordionGroup,
    Box,
    IconButton,
    LinearProgress,
    Textarea,
    ToggleButtonGroup,
    Tooltip,
} from "@mui/joy";

import ShareIcon from "@mui/icons-material/Share";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import {StateContext} from "../../../../../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    UrlContext,
} from "../../../../../contexts/UrlContextProvider";
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


enum QUERY_OPTION {
    IS_CASE_SENSITIVE = "isCaseSensitive",
    IS_REGEX = "isRegex",
}

/**
 * Determines if the query is case-sensitive based on the provided query options.
 *
 * @param queryOptions
 * @return True if the query is case-sensitive.
 */
const getIsCaseSensitive =
    (queryOptions: QUERY_OPTION[]) => queryOptions.includes(QUERY_OPTION.IS_CASE_SENSITIVE);

/**
 * Determines if the query is a regular expression based on the provided query options.
 *
 * @param queryOptions
 * @return True if the query is a regular expression.
 */
const getIsRegex =
    (queryOptions: QUERY_OPTION[]) => queryOptions.includes(QUERY_OPTION.IS_REGEX);

/**
 * Displays a panel for submitting queries and viewing query results.
 *
 * @return
 */
// eslint max-lines-per-function ["error", { "max": 140 }]
// eslint-disable-next-line max-lines-per-function
const SearchTabPanel = () => {
    const {queryProgress, queryResults, startQuery, uiState} = useContext(StateContext);
    const {queryString: urlQueryString} = useContext(UrlContext);
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [queryOptions, setQueryOptions] = useState<QUERY_OPTION[]>([]);
    const [queryString, setQueryString] = useState<string>(urlQueryString ?? "");

    const handleCollapseAllButtonClick = () => {
        setIsAllExpanded((v) => !v);
    };
    const handleShareButtonClick = () => {
        copyPermalinkToClipboard({}, {
            queryString: queryString,
            queryIsCaseSensitive: getIsCaseSensitive(queryOptions),
            queryIsRegex: getIsRegex(queryOptions),
        });
    };

    const handleQuerySubmit = (newArgs: Partial<QueryArgs>) => {
        startQuery({
            queryIsCaseSensitive: getIsCaseSensitive(queryOptions),
            queryIsRegex: getIsRegex(queryOptions),
            queryString: queryString,
            ...newArgs,
        });
    };

    const handleQueryInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQueryString(ev.target.value);
        handleQuerySubmit({queryString: ev.target.value});
    };

    const handleQueryOptionsChange = (
        _: React.MouseEvent<HTMLElement>,
        newOptions: QUERY_OPTION[]
    ) => {
        setQueryOptions(newOptions);
        handleQuerySubmit({
            queryIsCaseSensitive: getIsCaseSensitive(newOptions),
            queryIsRegex: getIsRegex(newOptions),
        });
    };

    const isQueryInputBoxDisabled = isDisabled(uiState, UI_ELEMENT.QUERY_INPUT_BOX);

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SEARCH}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SEARCH]}
            titleButtons={
                <>
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
                    <PanelTitleButton
                        title={"Copy URL with search parameters"}
                        onClick={handleShareButtonClick}
                    >
                        <ShareIcon/>
                    </PanelTitleButton>
                </>
            }
        >
            <Box className={"search-tab-container"}>
                <div className={"query-input-box-with-progress"}>
                    <Textarea
                        className={"query-input-box"}
                        maxRows={7}
                        placeholder={"Search"}
                        size={"sm"}
                        value={queryString}
                        endDecorator={
                            <ToggleButtonGroup
                                disabled={isQueryInputBoxDisabled}
                                size={"sm"}
                                spacing={0.25}
                                value={queryOptions}
                                variant={"plain"}
                                onChange={handleQueryOptionsChange}
                            >
                                <Tooltip title={"Match case"}>
                                    <span>
                                        <IconButton
                                            className={"query-option-button"}
                                            value={QUERY_OPTION.IS_CASE_SENSITIVE}
                                        >
                                            Aa
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title={"Use regular expression"}>
                                    <span>
                                        <IconButton
                                            className={"query-option-button"}
                                            value={QUERY_OPTION.IS_REGEX}
                                        >
                                            .*
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </ToggleButtonGroup>
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
