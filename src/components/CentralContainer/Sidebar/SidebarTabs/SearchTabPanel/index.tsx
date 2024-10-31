import {
    useContext,
    useRef,
    useState,
} from "react";

import {
    AccordionGroup,
    IconButton,
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


enum SEARCH_OPTION {
    IS_CASE_SENSITIVE = "isCaseSensitive",
    IS_REGEX = "isRegex"
}

/**
 * Displays a panel for submitting search queries and viewing query results.
 *
 * @return
 */
const SearchTabPanel = () => {
    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [searchOptions, setSearchOptions] = useState<SEARCH_OPTION[]>([]);
    const searchTextRef = useRef<HTMLTextAreaElement>(null);
    const {queryResults, startQuery} = useContext(StateContext);
    const handleSearch = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ("Enter" === event.key && searchTextRef.current) {
            event.preventDefault();
            const isCaseSensitive = searchOptions.includes(SEARCH_OPTION.IS_CASE_SENSITIVE);
            const isRegex = searchOptions.includes(SEARCH_OPTION.IS_REGEX);
            startQuery(searchTextRef.current.value, isRegex, isCaseSensitive);
        }
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
                maxRows={7}
                placeholder={"Search"}
                size={"sm"}
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
                                sx={{fontFamily: "Inter"}}
                                value={SEARCH_OPTION.IS_CASE_SENSITIVE}
                            >
                                Aa
                            </IconButton>
                            <IconButton
                                sx={{fontFamily: "Inter"}}
                                value={SEARCH_OPTION.IS_REGEX}
                            >
                                .*
                            </IconButton>
                        </ToggleButtonGroup>
                    </>
                }
                slotProps={{
                    textarea: {ref: searchTextRef},
                    endDecorator: {sx: {marginBlockStart: 0, display: "block"}},
                }}
                onKeyDown={handleSearch}/>
            <AccordionGroup
                disableDivider={true}
                size={"sm"}
            >
                <ResultsGroup
                    isAllExpanded={isAllExpanded}
                    queryResults={queryResults}/>
            </AccordionGroup>
        </CustomTabPanel>
    );
};

export default SearchTabPanel;
