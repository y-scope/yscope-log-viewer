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
} from "@mui/joy";

import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import {StateContext} from "../../../../../contexts/StateContextProvider";
import {UI_ELEMENT} from "../../../../../typings/states";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import {QUERY_PROGRESS_DONE} from "../../../../../typings/worker";
import {isDisabled} from "../../../../../utils/states";
import CustomTabPanel from "../CustomTabPanel";
import PanelTitleButton from "../PanelTitleButton";
import ResultsGroup from "./ResultsGroup";

import "./index.css";


enum QUERY_OPTION {
    IS_CASE_SENSITIVE = "isCaseSensitive",
    IS_REGEX = "isRegex"
}

/**
 * Displays a panel for submitting queries and viewing query results.
 *
 * @return
 */
const SearchTabPanel = () => {
    const {queryProgress, queryResults, startQuery, uiState} = useContext(StateContext);
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [queryOptions, setQueryOptions] = useState<QUERY_OPTION[]>([]);

    const handleQueryInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const isCaseSensitive = queryOptions.includes(QUERY_OPTION.IS_CASE_SENSITIVE);
        const isRegex = queryOptions.includes(QUERY_OPTION.IS_REGEX);
        startQuery(ev.target.value, isRegex, isCaseSensitive);
    };
    const handleQueryOptionsChange = (
        _: React.MouseEvent<HTMLElement>,
        newOptions: QUERY_OPTION[]
    ) => {
        setQueryOptions(newOptions);
    };

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SEARCH}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SEARCH]}
            titleButtons={
                <PanelTitleButton onClick={() => { setIsAllExpanded((v) => !v); }}>
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
                        disabled={isDisabled(uiState, UI_ELEMENT.QUERY_INPUT_BOX)}
                        maxRows={7}
                        placeholder={"Search"}
                        size={"sm"}
                        endDecorator={
                            <ToggleButtonGroup
                                size={"sm"}
                                spacing={0.25}
                                value={queryOptions}
                                variant={"plain"}
                                onChange={handleQueryOptionsChange}
                            >
                                <IconButton
                                    className={"query-option-button"}
                                    value={QUERY_OPTION.IS_CASE_SENSITIVE}
                                >
                                    Aa
                                </IconButton>
                                <IconButton
                                    className={"query-option-button"}
                                    value={QUERY_OPTION.IS_REGEX}
                                >
                                    .*
                                </IconButton>
                            </ToggleButtonGroup>
                        }
                        slotProps={{
                            textarea: {className: "query-input-box-textarea"},
                            endDecorator: {className: "query-input-box-end-decorator"},
                        }}
                        onChange={handleQueryInputChange}/>
                    <LinearProgress
                        className={"query-input-box-linear-progress"}
                        determinate={true}
                        thickness={4}
                        value={queryProgress * 100}
                        color={QUERY_PROGRESS_DONE === queryProgress ?
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
