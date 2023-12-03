import React, {useEffect, useState} from "react";

import PropTypes from "prop-types";
import {ProgressBar} from "react-bootstrap";
import {
    ArrowsCollapse,
    ArrowsExpand, CaretDownFill,
    CaretRightFill
} from "react-bootstrap-icons";

import "./SearchPanel.scss";

SearchPanel.propTypes = {
    query: PropTypes.string,
    searchResults: PropTypes.array,
    totalPages: PropTypes.number,
    queryChangeHandler: PropTypes.func,
    searchResultClickHandler: PropTypes.func,
};


/**
 * Callback when the query is changed
 * @callback QueryChangeHandler
 * @param {string} query
 */

/**
 * Callback when a result is clicked
 * @callback SearchResultClickHandler
 * @param {number} logEventIdx
 */

/**
 * The search panel
 * @param {string} query
 * @param {array} searchResults
 * @param {number} totalPages
 * @param {QueryChangeHandler} queryChangeHandler
 * @param {SearchResultClickHandler} searchResultClickHandler
 * @return {JSX.Element}
 */
export function SearchPanel ({
    query,
    searchResults,
    totalPages,
    queryChangeHandler,
    searchResultClickHandler,
}) {
    const [collapseAll, setCollapseAll] = useState(false);
    const handleCollapseAllClick = () => {
        setCollapseAll(!collapseAll);
    };

    const queryInputChangeHandler = (e) => {
        // auto resize height of the input box
        e.target.style.height = 0;
        e.target.style.height = e.target.scrollHeight + 6 + "px";

        const newQuery = e.target.value;
        queryChangeHandler(newQuery);
    };

    let resultGroups = <></>;
    let progress = null;
    if (searchResults !== null) {
        resultGroups = searchResults.map((resultGroup, index) => (
            <SearchResultsGroup
                key={index}
                pageNum={resultGroup.page_num}
                results={resultGroup}
                collapseAll={collapseAll}
                setCollapseAll={setCollapseAll}
                resultClickHandler={searchResultClickHandler}
            />
        ));
        if (searchResults.length) {
            progress = (searchResults[searchResults.length - 1].page_num + 1) /
            totalPages * 100;
        } else {
            // instead of 0 set progress as 5% to show something is being loaded
            progress = 5;
        }
    }
    return (
        <>
            <div style={{padding: "0 15px"}}>
                <div className={"tab-search-header"}>
                    <div className={"tab-search-header-text"}>SEARCH</div>
                    <button className={"tab-search-header-button"}
                        onClick={handleCollapseAllClick}>
                        {collapseAll ? <ArrowsExpand/> : <ArrowsCollapse/>}
                    </button>
                </div>
                <form>
                    <textarea
                        className={"search-input"}
                        onChange={queryInputChangeHandler}
                        placeholder={"Query"}
                        value={query}
                    />
                </form>
                {(progress !== null) &&
                    <ProgressBar animated={progress !== 100} now={progress}
                        style={{height: "3px"}}/>}
            </div>
            <div className={"search-results-container"}>
                {resultGroups}
            </div>
        </>
    );
}

SearchResultsGroup.propTypes = {
    pageNum: PropTypes.number,
    results: PropTypes.object,
    collapseAll: PropTypes.bool,
    setCollapseAll: PropTypes.func,
    resultClickHandler: PropTypes.func,
};

/**
 * Callback used to set collapse all flag
 * @callback SetCollapseAll
 * @param {boolean} collapseAll
 */

/**
 * Callback when a result is clicked
 * @callback ResultClickHandler
 * @param {number} logEventIdx
 */

/**
 * The search results on a page
 * @param {number} pageNum
 * @param {object} results
 * @param {boolean} collapseAll
 * @param {SetCollapseAll} setCollapseAll
 * @param {ResultClickHandler} resultClickHandler
 * @return {JSX.Element}
 */
function SearchResultsGroup ({
    pageNum,
    results,
    collapseAll,
    setCollapseAll,
    resultClickHandler}) {
    if (results.searchResults.length === 0) {
        return <></>;
    }

    const [collapsed, setCollapsed] = useState(true);
    const onHeaderClickHandler = () => {
        setCollapsed(!collapsed);
    };

    useEffect(()=>{
        setCollapsed(collapseAll);
    }, [collapseAll]);

    const resultsRows = results.searchResults.map((result) => {
        const [prefix, postfix] = result["content"].split(result["match"]);
        return (
            <button
                className={"search-result-button"}
                key={result.eventIndex}
                onClick={() => {
                    resultClickHandler(result.eventIndex + 1);
                }}
            >
                {/* Cap prefix length to be 25 characters
                     so highlighted text can be shown */}
                <span>{prefix.slice(-25)}</span>
                <span
                    className={"search-result-highlight"}>{result["match"]}</span>
                <span>{postfix}</span>
            </button>
        );
    });

    return (
        <>
            <button className={"search-results-page-header"}
                onClick={onHeaderClickHandler}>
                <div className={"search-results-page-header-page-num"}>
                    {collapsed ?
                        <CaretDownFill size={14}/> :
                        <CaretRightFill size={14}/>}
                    &nbsp;PAGE {pageNum + 1}
                </div>
                <div className={"search-results-page-header-result-count"}>
                    {results.searchResults.length}
                </div>
            </button>
            <div>
                {!collapsed && resultsRows}
            </div>
        </>
    );
}
