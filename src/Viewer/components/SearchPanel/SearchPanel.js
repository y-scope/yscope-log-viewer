import React from "react";

import PropTypes from "prop-types";

import "./SearchPanel.scss";

SearchPanel.propTypes = {
    query: PropTypes.string,
    queryChangeHandler: PropTypes.func,
    searchResults: PropTypes.array,
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
 * @param {QueryChangeHandler} queryChangeHandler
 * @param {array} searchResults
 * @param {SearchResultClickHandler} searchResultClickHandler
 * @return {JSX.Element}
 */
export function SearchPanel ({
    query,
    queryChangeHandler,
    searchResults,
    searchResultClickHandler,
}) {
    const queryInputChangeHandler = (e) => {
        const newQuery = e.target.value;
        queryChangeHandler(newQuery);
    };

    const resultGroups = searchResults.map((resultGroup, index) => (
        <SearchResultsGroup
            key={index}
            pageNum={resultGroup.page_num}
            results={resultGroup}
            resultClickHandler={searchResultClickHandler}
        />
    ));

    return (
        <>
            <div style={{padding: "0 15px"}}>
                <span className={"search-input-label"}>SEARCH</span>
                <form>
                    <textarea
                        className={"search-input"}
                        onChange={queryInputChangeHandler}
                        placeholder={"Query"}
                        value={query}
                    />
                </form>
            </div>
            <div className={"search-results-container"}>
                {resultGroups}
            </div>
        </>
    );
}

SearchResultsGroup.propTypes = {
    pageNum: PropTypes.number,
    results: PropTypes.array,
    resultClickHandler: PropTypes.func,
};

/**
 * Callback when a result is clicked
 * @callback ResultClickHandler
 * @param {number} logEventIdx
 */

/**
 * The search results on a page
 * @param {number} pageNum
 * @param {array} results
 * @param {ResultClickHandler} resultClickHandler
 * @return {JSX.Element}
 */
function SearchResultsGroup ({pageNum, results, resultClickHandler}) {
    const onClickHandler = (e) => {
        const logEventIdx = Number(e.target.dataset.logeventidx) + 1;
        resultClickHandler(logEventIdx);
    };

    const resultsRows = results.searchResults.map((result, index) => (
        <button
            className={"search-result-button"}
            data-logeventidx={result.eventIndex}
            key={index}
            onClick={onClickHandler}
        >{result["content"]}</button>
    ));
    return (
        <>
            <div className={"search-results-page-num"}>PAGE {pageNum + 1}</div>
            <div>
                {resultsRows}
            </div>
        </>
    );
}
