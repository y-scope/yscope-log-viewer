import React, {useContext} from "react";

import {StateContext} from "../contexts/StateContextProvider";
import {
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
    } = useContext(StateContext);
    const {logEventNum} = useContext(UrlContext);

    const handleLogEventNumInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        updateWindowHashParams({logEventNum: Number(ev.target.value)});
    };

    return (
        <>
            <div>
                <h3>
                    LogEventNum -
                    {" "}
                    <input
                        type={"number"}
                        value={logEventNum}
                        onChange={handleLogEventNumInputChange}/>
                    {" "}
                    |
                    PageNum -
                    {" "}
                    {pageNum}
                </h3>

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
