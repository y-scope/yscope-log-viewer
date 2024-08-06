import React, {useContext} from "react";

import {StateContext} from "../contexts/StateContextProvider";
import {
    copyToClipboard,
    updateWindowHashParams,
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
        updateWindowHashParams({logEventNum: Number(ev.target.value)});
    };

    const handleCopyLinkButtonClick = () => {
        copyToClipboard({}, {logEventNum: numEvents});
    };

    return (
        <>
            <div>
                <h3>
                    LogEventNum -
                    {" "}
                    <input
                        defaultValue={logEventNum}
                        type={"number"}
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
