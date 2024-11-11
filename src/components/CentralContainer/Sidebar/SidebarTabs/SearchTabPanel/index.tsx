import React, {
    useContext,
    useState,
} from "react";

import {
    AccordionGroup,
    IconButton,
    LinearProgress,
    Textarea,
    ToggleButtonGroup,
} from "@mui/joy";

import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import {StateContext} from "../../../../../contexts/StateContextProvider";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import CustomTabPanel from "../CustomTabPanel";
import TitleButton from "../TitleButton";
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
    const {queryProgress, queryResults, startQuery} = useContext(StateContext);
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [queryOptions, setQueryOptions] = useState<QUERY_OPTION[]>([]);
    const handleQueryInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const isCaseSensitive = queryOptions.includes(QUERY_OPTION.IS_CASE_SENSITIVE);
        const isRegex = queryOptions.includes(QUERY_OPTION.IS_REGEX);
        startQuery(ev.target.value, isRegex, isCaseSensitive);
    };

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SEARCH}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SEARCH]}
            titleButtons={
                <TitleButton onClick={() => { setIsAllExpanded((v) => !v); }}>
                    {isAllExpanded ?
                        <UnfoldLessIcon/> :
                        <UnfoldMoreIcon/>}
                </TitleButton>
            }
        >
            <Textarea
                className={"query-input-box"}
                maxRows={7}
                placeholder={"Search"}
                size={"sm"}
                endDecorator={
                    <ToggleButtonGroup
                        size={"sm"}
                        spacing={0.25}
                        value={queryOptions}
                        variant={"plain"}
                        onChange={(_, newValue) => {
                            setQueryOptions(newValue);
                        }}
                    >
                        <IconButton
                            className={"query-option"}
                            value={QUERY_OPTION.IS_CASE_SENSITIVE}
                        >
                            Aa
                        </IconButton>
                        <IconButton
                            className={"query-option"}
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
                determinate={true}
                thickness={2}
                value={queryProgress * 100}/>
            <AccordionGroup
                disableDivider={true}
                size={"sm"}
            >
                {Array.from(queryResults.entries()).map(([pageNum, results]) => (
                    <ResultsGroup
                        isAllExpanded={isAllExpanded}
                        key={`${pageNum} + ${results.length}`}
                        pageNum={pageNum}
                        results={results}/>
                ))}
            </AccordionGroup>
        </CustomTabPanel>
    );
};

export default SearchTabPanel;
