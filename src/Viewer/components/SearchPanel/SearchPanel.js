import React, {useState} from "react";

import PropTypes from "prop-types";
import {ProgressBar} from "react-bootstrap";

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
    const queryInputChangeHandler = (e) => {
        // auto resize height of the input box
        e.target.style.height = 0;
        e.target.style.height = e.target.scrollHeight + 6 + "px";

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

    let progress = null;
    if (searchResults.length) {
        progress = (searchResults[searchResults.length - 1].page_num + 1) / totalPages * 100;
    }
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
                {(progress !== null) &&
                    <ProgressBar animated={progress !== 100} now={progress} style={{height: "3px"}}/>}
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
 * @param {object} results
 * @param {ResultClickHandler} resultClickHandler
 * @return {JSX.Element}
 */
function SearchResultsGroup ({pageNum, results, resultClickHandler}) {
    if (results.searchResults.length === 0) {
        return <></>;
    }

    const [expanded, setExpanded] = useState(true);
    const onHeaderClickHandler = () => {
        setExpanded(!expanded);
    };

    const resultsRows = results.searchResults.map((result, index) => {
        const [prefix, postfix] = result["content"].split(result["match"]);
        return (
            <button
                className={"search-result-button"}
                key={result.eventIndex}
                onClick={()=>{
                    resultClickHandler(result.eventIndex + 1);
                }}
            >
                <span>{prefix.slice(-25)}</span>
                <span className={"search-result-highlight"}>{result["match"]}</span>
                <span>{postfix}</span>
            </button>
        );
    });

    return (
        <>
            <button className={"search-results-page-header"} onClick={onHeaderClickHandler}>
                <div className={"search-results-page-header-page-num"}>{expanded?"⮞":"⮟"} PAGE {pageNum + 1}</div>
                <div className={"search-results-page-header-result-count"}>{results.searchResults.length}</div>
            </button>
            <div>
                {expanded && resultsRows}
            </div>
        </>
    );
}
