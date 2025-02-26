import React, {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    AccordionGroup,
    Box,
    LinearProgress,
    Stack,
    Textarea,
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
import ToggleIconButton from "./ToggleIconButton";

import "./index.css";


/**
 * Displays a panel for submitting queries and viewing query results.
 *
 * @return
 */
// eslint-disable-next-line max-lines-per-function
const SearchTabPanel = () => {
    const {queryProgress, queryResults, startQuery, uiState} = useContext(StateContext);
    const {
        queryString: urlQueryString,
        queryIsCaseSensitive: urlQueryIsCaseSensitive,
        queryIsRegex: urlQueryIsRegex,
    } = useContext(UrlContext);
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [queryString, setQueryString] = useState<string>("");
    const [queryIsCaseSensitive, setQueryIsCaseSensitive] = useState<boolean>(false);
    const [queryIsRegex, setQueryIsRegex] = useState<boolean>(false);

    useEffect(() => {
        if (null !== urlQueryString) {
            setQueryString(urlQueryString);
        }
    }, [urlQueryString]);

    useEffect(() => {
        if (null !== urlQueryIsCaseSensitive) {
            setQueryIsCaseSensitive(urlQueryIsCaseSensitive);
        }
    }, [urlQueryIsCaseSensitive]);

    useEffect(() => {
        if (null !== urlQueryIsRegex) {
            setQueryIsRegex(urlQueryIsRegex);
        }
    }, [urlQueryIsRegex]);

    const handleCollapseAllButtonClick = () => {
        setIsAllExpanded((v) => !v);
    };
    const handleShareButtonClick = () => {
        copyPermalinkToClipboard({}, {
            queryString: queryString,
            queryIsCaseSensitive: queryIsCaseSensitive,
            queryIsRegex: queryIsRegex,
        });
    };

    const handleQuerySubmit = (newArgs: Partial<QueryArgs>) => {
        startQuery({
            queryIsCaseSensitive: queryIsCaseSensitive,
            queryIsRegex: queryIsRegex,
            queryString: queryString,
            ...newArgs,
        });
    };

    const handleQueryInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQueryString(ev.target.value);
        handleQuerySubmit({queryString: ev.target.value});
    };

    const handleCaseSensitivityButtonClick = () => {
        handleQuerySubmit({queryIsCaseSensitive: !queryIsCaseSensitive});
        setQueryIsCaseSensitive(!queryIsCaseSensitive);
    };

    const handleRegexButtonClick = () => {
        handleQuerySubmit({queryIsRegex: !queryIsRegex});
        setQueryIsRegex(!queryIsRegex);
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
                            <Stack
                                direction={"row"}
                                spacing={0.25}
                            >
                                <ToggleIconButton
                                    className={"query-option-button"}
                                    disabled={isQueryInputBoxDisabled}
                                    isChecked={queryIsCaseSensitive}
                                    size={"sm"}
                                    tooltipTitle={"Match case"}
                                    variant={"plain"}
                                    onClick={handleCaseSensitivityButtonClick}
                                >
                                    Aa
                                </ToggleIconButton>

                                <ToggleIconButton
                                    className={"query-option-button"}
                                    disabled={isQueryInputBoxDisabled}
                                    isChecked={queryIsRegex}
                                    size={"sm"}
                                    tooltipTitle={"Use regular expression"}
                                    variant={"plain"}
                                    onClick={handleRegexButtonClick}
                                >
                                    .*
                                </ToggleIconButton>
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
