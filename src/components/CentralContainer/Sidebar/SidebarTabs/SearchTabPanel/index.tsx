import React, {
    useContext,
    useState,
} from "react";

import {
    AccordionGroup,
    Box,
    LinearProgress,
    Stack,
    Textarea,
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

    const handleCaseSensitivityButtonClick = () => {
        handleQuerySubmit({
            isCaseSensitive: isCaseSensitive,
        });
        setIsCaseSensitive(!isCaseSensitive);
    };

    const handleRegexButtonClick = () => {
        handleQuerySubmit({
            isRegex: !isRegex,
        });
        setIsRegex(!isRegex);
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
                                <ToggleIconButton
                                    className={"query-option-button"}
                                    disabled={isQueryInputBoxDisabled}
                                    isChecked={isCaseSensitive}
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
                                    isChecked={isRegex}
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
