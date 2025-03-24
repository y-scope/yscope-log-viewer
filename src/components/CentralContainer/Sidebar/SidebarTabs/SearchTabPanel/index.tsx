import {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AccordionGroup,
    Box,
} from "@mui/joy";

import ShareIcon from "@mui/icons-material/Share";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import {StateContext} from "../../../../../contexts/StateContextProvider";
import {
    copyPermalinkToClipboard,
    updateWindowUrlHashParams,
    URL_HASH_PARAMS_DEFAULT,
    UrlContext,
} from "../../../../../contexts/UrlContextProvider";
import {UI_STATE} from "../../../../../typings/states";
import {
    TAB_DISPLAY_NAMES,
    TAB_NAME,
} from "../../../../../typings/tab";
import {HASH_PARAM_NAMES} from "../../../../../typings/url";
import CustomTabPanel from "../CustomTabPanel";
import PanelTitleButton from "../PanelTitleButton";
import QueryInputBox from "./QueryInputBox";
import ResultsGroup from "./ResultsGroup";

import "./index.css";


/**
 * Displays a panel for submitting queries and viewing query results.
 *
 * @return
 */
const SearchTabPanel = () => {
    const {queryResults, uiState, startQuery} = useContext(StateContext);
    const {
        queryString: urlQueryString,
        queryIsCaseSensitive: urlQueryIsCaseSensitive,
        queryIsRegex: urlQueryIsRegex,
    } = useContext(UrlContext);

    const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);
    const [queryString, setQueryString] = useState<string>("");
    const [queryIsCaseSensitive, setQueryIsCaseSensitive] = useState<boolean>(false);
    const [queryIsRegex, setQueryIsRegex] = useState<boolean>(false);

    const queryIsCaseSensitiveRef = useRef(false);
    const queryIsRegexRef = useRef(false);

    const handleCollapseAllButtonClick = () => {
        setIsAllExpanded((v) => !v);
    };
    const handleShareButtonClick = () => {
        copyPermalinkToClipboard({}, {
            logEventNum: null,
            queryString: "" === queryString ?
                null :
                queryString,
            queryIsCaseSensitive: queryIsCaseSensitive,
            queryIsRegex: queryIsRegex,
        });
    };

    useEffect(() => {
        queryIsCaseSensitiveRef.current = urlQueryIsCaseSensitive ?? false;
    }, [urlQueryIsCaseSensitive]);

    useEffect(() => {
        queryIsRegexRef.current = urlQueryIsRegex ?? false;
    }, [urlQueryIsRegex]);

    useEffect(() => {
        if (uiState === UI_STATE.FILE_LOADING) {
            setQueryString("");
            setQueryIsCaseSensitive(false);
            setQueryIsRegex(false);
        } else if (uiState === UI_STATE.READY) {
            if (null !== urlQueryString) {
                setQueryString(urlQueryString);
                setQueryIsCaseSensitive(queryIsCaseSensitiveRef.current);
                setQueryIsRegex(queryIsRegexRef.current);

                startQuery({
                    queryIsCaseSensitive: queryIsCaseSensitiveRef.current,
                    queryIsRegex: queryIsRegexRef.current,
                    queryString: urlQueryString,
                });

                updateWindowUrlHashParams({
                    [HASH_PARAM_NAMES.QUERY_STRING]: URL_HASH_PARAMS_DEFAULT.queryString,
                    [HASH_PARAM_NAMES.QUERY_IS_CASE_SENSITIVE]:
                        URL_HASH_PARAMS_DEFAULT.queryIsCaseSensitive,
                    [HASH_PARAM_NAMES.QUERY_IS_REGEX]: URL_HASH_PARAMS_DEFAULT.queryIsRegex,
                });
            }
        }
    }, [
        startQuery,
        uiState,
        urlQueryString,
    ]);

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
                <QueryInputBox
                    queryIsCaseSensitive={queryIsCaseSensitive}
                    queryIsRegex={queryIsRegex}
                    queryString={queryString}
                    setQueryIsCaseSensitive={setQueryIsCaseSensitive}
                    setQueryIsRegex={setQueryIsRegex}
                    setQueryString={setQueryString}/>
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
