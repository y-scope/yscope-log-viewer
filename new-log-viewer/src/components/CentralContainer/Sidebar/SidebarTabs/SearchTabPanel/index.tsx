import {useState} from "react";

import {
    AccordionGroup,
    IconButton,
    Textarea,
    ToggleButtonGroup,
} from "@mui/joy";

import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import CustomTabPanel from "../CustomTabPanel";
import TitleButton from "../TitleButton";
import ResultsGroup from "./ResultsGroup";


enum SEARCH_OPTION {
    IS_CASE_SENSITIVE = "isCaseSensitive",
    IS_REGEX = "isRegex"
}

/**
 *
 */
const SAMPLE_RESULTS = Object.freeze({
    1: [{logEventNum: 1,
        message: "hi how are you",
        matchRange: [0,
            2]}],
    2: [{logEventNum: 202,
        message: "i'm a super long message that supposedly overflows in the panel width.",
        matchRange: [4,
            6]}],
    8: [{logEventNum: 808,
        message: "hi how are you",
        matchRange: [4,
            6]},
    {logEventNum: 809,
        message: "hi how are you",
        matchRange: [4,
            6]}],
});

/**
 * Displays a panel for submitting search queries and viewing query results.
 *
 * @return
 */
const SearchTabPanel = () => {
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [searchOptions, setSearchOptions] = useState<SEARCH_OPTION[]>([]);

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SEARCH}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SEARCH]}
            titleButtons={<>
                <TitleButton onClick={() => { setIsAllExpanded((v) => !v); }}>
                    {isAllExpanded ?
                        <UnfoldLessIcon/> :
                        <UnfoldMoreIcon/>}
                </TitleButton>
            </>}
        >
            <Textarea
                maxRows={7}
                placeholder={"Search"}
                size={"sm"}
                slotProps={{endDecorator: {sx: {marginBlockStart: 0, display: "block"}}}}
                sx={{flexDirection: "row"}}
                endDecorator={
                    <>
                        <ToggleButtonGroup
                            size={"sm"}
                            spacing={0.3}
                            sx={{borderRadius: "2px"}}
                            value={searchOptions}
                            variant={"plain"}
                            onChange={(_, newValue) => {
                                setSearchOptions(newValue);
                            }}
                        >
                            <IconButton
                                sx={{fontFamily: "Roboto Mono"}}
                                value={SEARCH_OPTION.IS_CASE_SENSITIVE}
                            >
                                Aa
                            </IconButton>
                            <IconButton
                                sx={{fontFamily: "Roboto Mono"}}
                                value={SEARCH_OPTION.IS_REGEX}
                            >
                                .*
                            </IconButton>
                        </ToggleButtonGroup>
                    </>
                }/>
            <AccordionGroup
                disableDivider={true}
                size={"sm"}
            >
                {Object.entries(SAMPLE_RESULTS).map(([pageNum, resultsOnPage]) => (
                    <ResultsGroup
                        isAllExpanded={isAllExpanded}
                        key={pageNum}
                        pageNum={pageNum}
                        results={resultsOnPage}/>
                ))}
            </AccordionGroup>
        </CustomTabPanel>
    );
};

export default SearchTabPanel;
