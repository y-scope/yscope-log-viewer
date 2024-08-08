import React, {useContext} from "react";

import {StateContext} from "../contexts/StateContextProvider";
import {
    copyWindowUrlToClipboard,
    updateWindowUrlHashParams,
    UrlContext,
} from "../contexts/UrlContextProvider";


/**
 * Renders the major layout of the log viewer.
 *
 * @return
 */
const Layout = () => {
    const {
        logData,
        pageNum,
        numEvents,
    } = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const handleLogEventNumInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        updateWindowUrlHashParams({logEventNum: Number(ev.target.value)});
    };

    const handleCopyLinkButtonClick = () => {
        copyWindowUrlToClipboard({}, {logEventNum: numEvents});
    };

    return (
        <>
            <div>
                <h3>
                    LogEventNum -
                    {" "}
                    <input
                        type={"number"}
                        value={null === logEventNum ?
                            1 :
                            logEventNum}
                        onChange={handleLogEventNumInputChange}/>
                    {" "}
                    |
                    PageNum -
                    {" "}
                    {pageNum}
                </h3>

                <button onClick={handleCopyLinkButtonClick}>
                    Copy link to last log
                </button>

                {logData.split("\n").map((line, index) => (
                    <p key={index}>
                        {`<${index + 1}>`}
                        -
                        {line}
                    </p>
                ))}
            </div>
        </>
    );
};

export default Layout;
