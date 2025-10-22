import {
    useCallback,
    useState,
} from "react";

import {
    AccordionGroup,
    Box,
    Link,
} from "@mui/joy";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ShareIcon from "@mui/icons-material/Share";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import useLogFileStore from "../../../../../stores/logFileStore";
import useQueryStore from "../../../../../stores/queryStore";
import useViewStore from "../../../../../stores/viewStore";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import {
    copyPermalinkToClipboard,
    URL_HASH_PARAMS_DEFAULT,
} from "../../../../../utils/url";
import CustomTabPanel from "../CustomTabPanel";
import PanelTitleButton from "../PanelTitleButton";
import FilterInputBox from "./FilterInputBox";
import QueryInputBox from "./QueryInputBox";
import ResultsGroup from "./ResultsGroup";

import "./index.css";


/**
 * Displays a panel for submitting queries and viewing query results.
 *
 * @return
 */
const SearchTabPanel = () => {
    const fileTypeInfo = useLogFileStore((state) => state.fileTypeInfo);
    const queryResults = useQueryStore((state) => state.queryResults);

    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);

    const handleCollapseAllButtonClick = useCallback(() => {
        setIsAllExpanded((v) => !v);
    }, []);

    const handleShareButtonClick = useCallback(() => {
        const {
            queryIsCaseSensitive,
            queryIsRegex,
            queryString,
            setQueryIsCaseSensitive,
            setQueryIsRegex,
            setQueryString,
        } = useQueryStore.getState();

        const {kqlFilterInput} = useViewStore.getState();

        setQueryIsCaseSensitive(queryIsCaseSensitive);
        setQueryIsRegex(queryIsRegex);
        setQueryString(queryString);

        copyPermalinkToClipboard({}, {
            logEventNum: URL_HASH_PARAMS_DEFAULT.logEventNum,
            query: kqlFilterInput,
            queryIsCaseSensitive: queryIsCaseSensitive,
            queryIsRegex: queryIsRegex,
            subquery: queryString,
        });
    }, []);

    const isKqlFilteringEnabled = null !== fileTypeInfo &&
        "CLP IR" === fileTypeInfo.name &&
        true === fileTypeInfo.isStructured;

    return (
        <CustomTabPanel
            tabName={TAB_NAME.SEARCH}
            title={TAB_DISPLAY_NAMES[TAB_NAME.SEARCH]}
            titleButtons={
                <>
                    {isKqlFilteringEnabled &&
                    <PanelTitleButton
                        title={"KQL query syntax"}
                    >
                        <Link
                            color={"neutral"}
                            href={"https://docs.yscope.com/clp/main/user-docs/reference-json-search-syntax.html"}
                            level={"body-sm"}
                            rel={"noopener"}
                            target={"_blank"}
                        >
                            <HelpOutlineIcon/>
                        </Link>
                    </PanelTitleButton>}
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
                {
                    isKqlFilteringEnabled ?
                        <div className={"query-input-boxes-container"}>
                            <FilterInputBox/>
                            <QueryInputBox/>
                        </div> :
                        <QueryInputBox/>
                }
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
